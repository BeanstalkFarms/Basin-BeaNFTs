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
    # Each entry is of type: {account: [deposit_count, first_deposit_season, cummulative_deposited_bdv, [individual_deposited_bdv]]}
    qualified_accounts_stats = {}

    # Iterate through the entries in the "addDeposits" list and populate the dictionary
    for entry in add_deposits:
        account = entry["account"]
        season = int(entry["season"])
        bdv = int(entry["bdv"])
        if account in qualified_accounts_stats:
            qualified_accounts_stats[account] = [qualified_accounts_stats[account][0] + 1, qualified_accounts_stats[account][1] , qualified_accounts_stats[account][2] + bdv , qualified_accounts_stats[account][3] + [bdv]]
        else:
            qualified_accounts_stats[account] = [1, season, bdv, [bdv]]
    
    return qualified_accounts_stats, add_deposits

# Runs the graphql query against the beanstalk subgraph
def run_query(query):
    # endpoint where you are making the request
    url = 'https://graph.node.bean.money/subgraphs/name/beanstalk'
    request = requests.post(url, '', json={'query': query})
    if request.status_code == 200:
        return request.json()
    else:
        raise Exception('Query failed. return code is {}.{}'.format(request.status_code, query))

# Checks if the account has removals in the 600 seasons post deposit
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
            result = run_query(query)
            # Remove the quotes from the account string
            account = account[1:-1]
            print(account)
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
    # TODO: Improve the filtering logic
    for account in account_bdv_removed:
        # If the account removed more than 20% of the bdv they deposited
        # Subtract 1 from the nfts qualified count and subtract the bdv removed from the cummulative deposited bdv
        if account_bdv_removed[account] / qualified_accounts_stats[account][1] > 0.2:
            qualified_accounts_stats[account][0] -= 1
            qualified_accounts_stats[account][2] -= account_bdv_removed[account] 
    return qualified_accounts_stats

def addressHasBeaNFTs(wallet_address):
    for collection in previous_beaNFT_collections:
        url = f"https://eth-mainnet.g.alchemy.com/nft/v2/{ALCHEMY_API_KEY}/isHolderOfCollection?wallet={wallet_address}&contractAddress={collection}"
        headers = {"accept": "application/json"}
        response = requests.get(url, headers=headers)
        isHolder = response.json()["isHolderOfCollection"]
        return isHolder

def get_total_nfts(qualified_account_stats):
    total_nfts = 0
    for account in qualified_account_stats:
        total_nfts += qualified_account_stats[account][0]
    return total_nfts

def extract_to_csv(qualified_account_stats):
    # export qualified_account_stats to csv file
    with open('qualified-accounts.csv', 'w') as file:
        file.write("Account,NFTs Qualified,First Deposit Season,Cummulative Deposited BDV,Individual Deposited BDV\n")
        for account in qualified_account_stats:
            file.write(account + "," + str(qualified_account_stats[account][0]) + "," + str(qualified_account_stats[account][1]) + "," + str(qualified_account_stats[account][2]) + "," + str(qualified_account_stats[account][3]) + "\n")

# List of previous beaNFT collections
                                # Genesis                                      # Winter                                       # Barn Raise
previous_beaNFT_collections = ["0xa755A670Aaf1FeCeF2bea56115E65e03F7722A79", "0x459895483556daD32526eFa461F75E33E458d9E9" , "0xa969BB19b1d35582Ded7EA869cEcD60A3Bd5D1E8" ]


if __name__ == "__main__":
    load_dotenv()
    ALCHEMY_API_KEY = os.getenv('ALCHEMY_API_KEY')
    qualified_account_stats, add_deposits = construct_account_dict()
    for account in qualified_account_stats:
        hasBeaNFT = addressHasBeaNFTs(account)
        print(f"{account} has beaNFTs: {hasBeaNFT}")
    print(qualified_account_stats)
    # final_dict = filter_qualified_accounts(qualified_account_stats)

