import json
import requests
from pprint import pprint
import os
from dotenv import load_dotenv

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

# Checks if the account has removals in the 600 seasons post intial deposit
# and if so, filters the account from the qualified accounts dictionary
def filter_qualified_accounts(qualified_accounts_stats):
    accounts_visited = set()
    account_bdv_removed = {}
    # For every qualified deposit
    for entry in add_deposits:
        account = entry["account"]
        # If the account has already been visited, skip it
        if account in accounts_visited:
            continue
        else:
            # format the account string for graphql compatibility
            account = '"' + account + '"'
            # Search for removals
            season_start = entry["season"]
            season_end = season_start + 600
            query = '{ removeDeposits( where: {account: ' + account + ', token_contains: "0xbea0e11282e2bb5893bece110cf199501e872bad", season_gte: ' + str(season_start) + ', season_lte: ' + str(season_end) + ' }) {blockNumber hash season account amount token bdv}}'
            result = run_graph_query(query)
            # Remove the quotes from the account string
            account = account[1:-1]
            # If there are removals
            if result["data"]["removeDeposits"]:
                account_bdv_removed[account] = 0
                # For every remove deposit event in the list
                for i in range(len(result["data"]["removeDeposits"])):
                    bdv = int(result["data"]["removeDeposits"][i]["bdv"])
                    account_bdv_removed[account] += bdv
                    print("Account: " + account + " removed " + str(bdv) + " bdv")
            accounts_visited.add(account)
    # Filter the qualified accounts dictionary
    for account in account_bdv_removed:
        # If the account removed more than 20% of the bdv they deposited
        # Subtract 1 from the nfts qualified count and subtract the bdv removed from the cummulative deposited bdv
        if account_bdv_removed[account] / qualified_accounts_stats[account][1] > 0.2:
            qualified_accounts_stats[account][0] -= 1
            qualified_accounts_stats[account][2] -= account_bdv_removed[account] 
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
def get_total_nfts_to_be_minted(qualified_account_stats):
    total_nfts = 0
    for account in qualified_account_stats:
        total_nfts += qualified_account_stats[account][0]
    return total_nfts

# Returns the season and bdv of all removals in the 600 seasons post initial deposit
def get_address_removes(wallet_address, season_start):
    # Sanitize for graphql
    wallet_address = '"' + wallet_address + '"'
    season_end = season_start + 600
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

# Export all qualified account stats to csv file for rarity score calculation
def extract_to_csv_preliminary_filtering(qualified_account_stats):
    with open('qualified_accounts.csv', 'w') as file:
        file.write("account,deposit_count,cummulative_deposited_bdv,cummulative_removed_bdv,beanft_count\n")
        for account in qualified_account_stats:
            file.write(account + "," + str(qualified_account_stats[account][0]) + "," + str(qualified_account_stats[account][1]) + "," + str(qualified_account_stats[account][2]) + "," + str(qualified_account_stats[account][7]) + "\n")

# List of previous beaNFT collections
                                # Genesis                                      # Winter                                       # Barn Raise
previous_beaNFT_collections = ["0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79", "0x459895483556daD32526eFa461F75E33E458d9E9" , "0xa969BB19b1d35582Ded7EA869cEcD60A3Bd5D1E8" ]

# {account: [deposit_count, cummulative_deposited_bdv, cummulative_removed_bdv, [individual_deposit_season], [individual_deposited_bdv]] , [individual_remove_season] , [individual_remove_bdv], beanft_count}
if __name__ == "__main__":
    load_dotenv()
    ALCHEMY_API_KEY = os.getenv('ALCHEMY_API_KEY')
    qualified_account_stats, add_deposits = construct_account_dict()
    # for account in qualified_account_stats:
    #     # get previous beanft count from csv
    #     count = get_address_beanft_count_csv(account)
    #     qualified_account_stats[account][7] = count
    #     cummulative_remove_bdv, remove_seasons , remove_bdvs = get_address_removes(account, qualified_account_stats[account][3][0])
    #     qualified_account_stats[account][2] = cummulative_remove_bdv
    #     qualified_account_stats[account][5] = remove_seasons
    #     qualified_account_stats[account][6] = remove_bdvs
    pprint(qualified_account_stats)
    # # final_dict = filter_qualified_accounts(qualified_account_stats)
