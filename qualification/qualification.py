import json
import requests
from pprint import pprint
import os
from dotenv import load_dotenv
import math

# Constructs a dictionary of initially qualified accounts
def construct_account_dict():
    # Load the JSON data from the file
    with open('initially-qualified-deposits.json', 'r') as file:
        data = json.load(file)

    # Access the "addDeposits" list from the JSON data
    add_deposits = data["data"]["addDeposits"]

    # Initialize an empty dictionary
    # Each entry is of type: 
    # {account: [deposit_count, cummulative_deposited_bdv, cummulative_removed_bdv, [individual_deposit_season], [individual_deposited_bdv]] , [individual_remove_season] , [individual_remove_bdv], beanft_count}
    qualified_accounts_stats = {}

    # Iterate through the entries in the "addDeposits" list and populate the dictionary
    for entry in add_deposits:
        account = entry["account"]
        season = int(entry["season"])
        bdv = int(entry["bdv"])
        if account in qualified_accounts_stats:  # deposit count                            # cummulative deposited bdv          # cummulative removed bdv             
            qualified_accounts_stats[account] = [qualified_accounts_stats[account][0] + 1, qualified_accounts_stats[account][1] + bdv , 0 , qualified_accounts_stats[account][3] + [season]   , qualified_accounts_stats[account][4] + [bdv], [] , [] , 0]
        else:
            qualified_accounts_stats[account] = [1, bdv , 0, [season], [bdv] , [] , [] , 0]
    
    return qualified_accounts_stats, add_deposits

# Runs the graphql query against the beanstalk subgraph
def run_graph_query(query):
    # endpoint where you are making the request
    url = 'https://graph.node.bean.money/subgraphs/name/beanstalk'
    request = requests.post(url, '', json={'query': query})
    if request.status_code == 200:
        return request.json()
    else:
        raise Exception('Query failed. return code is {}.{}'.format(request.status_code, query))

def final_filtering(qualified_accounts_stats):
    # Filter out disqualified accounts
    for account in accounts_dqd:
        if account in qualified_accounts_stats:
            qualified_accounts_stats.pop(account)
            print("Removed disqualified account: " + account)
    # Filter out accounts that have removed more than 20% of their deposited bdv
    # 0 = deposit count, 1 = cummulative deposited bdv, 2 = cummulative removed bdv
    for account in qualified_accounts_stats:
        percent_removed = qualified_accounts_stats[account][2] / qualified_accounts_stats[account][1]
        # If the account removed more than 20% of the bdv they deposited
        if percent_removed > 0.2:
            print("Account that had: " + str(qualified_account_stats[account][0]) + " nfts now has: " + str(qualified_account_stats[account][0] - math.ceil(percent_removed * qualified_accounts_stats[account][0])) + " due to: " + str(round(percent_removed, 2) * 100)  + "% bdv removals")
            qualified_accounts_stats[account][0] -= math.ceil(percent_removed * qualified_accounts_stats[account][0])
        # If the account removed less than 20% of the bdv they deposited, don't penalize
    return qualified_accounts_stats

# Checks if the account has beaNFTs
def address_has_beaNFTs(wallet_address):
    for collection in previous_beaNFT_collections:
        url = f"https://eth-mainnet.g.alchemy.com/nft/v2/{ALCHEMY_API_KEY}/isHolderOfCollection?wallet={wallet_address}&contractAddress={collection}"
        headers = {"accept": "application/json"}
        response = requests.get(url, headers=headers)
        isHolder = response.json()["isHolderOfCollection"]
        if isHolder:
            return isHolder
    return False

# Returns the number of beaNFTs from all collections the account has
# Uses the alchemy api
def get_address_beanft_count_api(wallet_address):
    count = 0
    for collection in previous_beaNFT_collections:
        url = f"https://eth-mainnet.g.alchemy.com/nft/v2/{ALCHEMY_API_KEY}/getNFTs?owner={wallet_address}&contractAddresses[]={collection}&withMetadata=false&pageSize=100"
        headers = {"accept": "application/json"}
        response = requests.get(url, headers=headers)
        count += int(response.json()["totalCount"])
    return count

# Returns the number of beaNFTs from all collections the account has
# Uses the csv file
def get_address_beanft_count_csv(wallet_address):
    count = 0
    with open('beanft_count.csv', 'r') as file:
        for line in file:
            if wallet_address in line:
                count = int(line.split(",")[1])
    return count

# Returns the total number of nfts to be minted
def get_total_qualified_deposits(qualified_account_stats):
    total_nfts = 0
    for account in qualified_account_stats:
        total_nfts += qualified_account_stats[account][0]
    return total_nfts

# Returns the season and bdv of all removals in the 600 seasons post initial deposit
def get_address_removals(wallet_address, season_start , future_seasons):
    # Sanitize for graphql
    wallet_address = '"' + wallet_address + '"'
    season_end = season_start + future_seasons
    print("Searching for removals for account: " + wallet_address + " from season: " + str(season_start) + " to season: " + str(season_end))
    query = '{ removeDeposits( where: {account: ' + wallet_address + ', token_contains: "0xbea0e11282e2bb5893bece110cf199501e872bad", season_gte: ' + str(season_start) + ', season_lte: ' + str(season_end) + ' }) {blockNumber hash season account amount token bdv}}'
    result = run_graph_query(query)
    remove_seasons = []
    remove_bdvs = []
    cummulative_remove_bdv = 0
    for i in range(len(result["data"]["removeDeposits"])):
        bdv = int(result["data"]["removeDeposits"][i]["bdv"])
        season = int(result["data"]["removeDeposits"][i]["season"])
        remove_seasons.append(season)
        remove_bdvs.append(bdv)
        cummulative_remove_bdv += bdv
    return cummulative_remove_bdv, remove_seasons, remove_bdvs

# Removes accounts with 0 qualified deposits
def remove_accounts_with_no_qualified_deposits(qualified_account_stats):
    accounts_to_remove = []
    for account in qualified_account_stats:
        if qualified_account_stats[account][0] == 0:
            accounts_to_remove.append(account)
    for account in accounts_to_remove:
        qualified_account_stats.pop(account)
    return qualified_account_stats

# {account: [deposit_count, cummulative_deposited_bdv, cummulative_removed_bdv, [individual_deposit_season], [individual_deposited_bdv]] , [individual_remove_season] , [individual_remove_bdv], beanft_count}
# Export account , deposit count, cummulative deposited bdv, cummulative removed bdv, beanft count to csv
def extract_to_csv(qualified_account_stats):
    # account stats
    with open('qualified_accounts.csv', 'w') as file:
        file.write("account,deposit_count,cummulative_deposited_bdv,cummulative_removed_bdv,beanft_count\n")
        for account in qualified_account_stats:
            file.write(account + "," + str(qualified_account_stats[account][0]) + "," + str(qualified_account_stats[account][1]) + "," + str(qualified_account_stats[account][2]) + "," + str(qualified_account_stats[account][7]) + "\n")
    # individual deposit and removal stats
    # each row should be
    # account,deposit_season,remove_season
    # populated with the the corresponding deposit and removal seasons from the deposit and removal lists
    # --> ie: individual_deposit_season1, individual_remove_season1 etc
    with open('qualified_accounts_individual_deposit_stats.csv', 'w') as file:
        file.write("account,deposit_season,remove_season\n")
        for account in qualified_account_stats:
            deposit_seasons = qualified_account_stats[account][3]
            # check for removals for 1000 seasons post initial deposit this time
            future_seasons = 1000
            cummulative_remove_bdv, remove_seasons, remove_bdvs = get_address_removals(account, qualified_account_stats[account][3][0] , future_seasons)
            for i in range(max(len(deposit_seasons), len(remove_seasons))):
                if i < len(deposit_seasons):
                    deposit_season = deposit_seasons[i]
                else:
                    deposit_season = ""
                if i < len(remove_seasons):
                    remove_season = remove_seasons[i]
                else:
                    remove_season = ""
                file.write(account + "," + str(deposit_season) + "," + str(remove_season) + "\n")
    
# List of previous beaNFT collections
previous_beaNFT_collections = [
    "0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79", # Genesis 
    "0x459895483556daD32526eFa461F75E33E458d9E9", # Winter
    "0xa969BB19b1d35582Ded7EA869cEcD60A3Bd5D1E8"  # Barn Raise
]

# List of disqualified accounts from preliminary filtering
# Accounts that removed all their deposits in the 600 seasons post initial deposit
accounts_dqd = [
"0xcde68f6a7078f47ee664ccbc594c9026a8a72d25",
"0xf7a7ae64cf9e9dd26fd2530a9b6fc571a31e75a1",
"0xccbf5d0a96ca77da1d21438eb9c06e485e6723c2",
"0x71678647939666d2c8d3c198b62da9028c5ebabc",
"0xa82240bb0291a8ef6e46a4f6b8abf4737b0b5257",
"0x6f9cee855cb1f362f31256c65e1709222e0f2037",
"0x4a6a6573393485cc410b20a021381fb39362b9d1",
"0xc65f06b01e114414aac120d54a2e56d2b75b1f85",
"0xa33be425a086db8899c33a357d5ad53ca3a6046e",
"0xd49aebfc9ac5e2886869135dadaff43eb522ac32",
"0x19c5bad4354e9a78a1ca0235af29b9eacf54ff2b",
"0x193641ea463c3b9244cf9f00b77ee5220d4154e9",
]

# {account: [deposit_count, cummulative_deposited_bdv, cummulative_removed_bdv, [individual_deposit_season], [individual_deposited_bdv]] , [individual_remove_season] , [individual_remove_bdv], beanft_count}
if __name__ == "__main__":
    load_dotenv()
    ALCHEMY_API_KEY = os.getenv('ALCHEMY_API_KEY')
    # Construct the dictionary of initially qualified accounts and deposits
    qualified_account_stats, add_deposits = construct_account_dict()
    for account in qualified_account_stats:
        # Get the beanft count for the account
        beanft_count = get_address_beanft_count_csv(account)
        qualified_account_stats[account][7] = beanft_count
        # Get the cummulative bdv removal 600 season post initial deposit and the individual removal info
        future_seasons = 600
        cummulative_remove_bdv, remove_seasons, remove_bdvs = get_address_removals(account, qualified_account_stats[account][3][0] , future_seasons)
        # Populate the dictionary with the removal info
        qualified_account_stats[account][2] = cummulative_remove_bdv
        qualified_account_stats[account][5] = remove_seasons
        qualified_account_stats[account][6] = remove_bdvs
    # Filter out disqualified accounts and accounts that removed more than 20% of their deposited bdv
    qualified_account_stats = final_filtering(qualified_account_stats)
    # Remove accounts with 0 qualified deposits
    qualified_account_stats = remove_accounts_with_no_qualified_deposits(qualified_account_stats)
    # Export to csv
    extract_to_csv(qualified_account_stats)
    print("Total number of qualified deposits: " + str(get_total_qualified_deposits(qualified_account_stats)))
    print("Total number of qualified accounts: " + str(len(qualified_account_stats)))
