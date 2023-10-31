import json
import requests
from pprint import pprint

# Constructs a dictionary of initially qualified accounts
def construct_account_dict():
    # Load the JSON data from the file
    with open('initially-qualified-deposits.json', 'r') as file:
        data = json.load(file)

    # Access the "addDeposits" list from the JSON data
    add_deposits = data["data"]["addDeposits"]

    # Initialize an empty dictionary
    # Each entry is of type: {account: [count, cummulative_deposited_bdv]}
    qualified_accounts_stats = {}

    # Iterate through the entries in the "addDeposits" list and populate the dictionary
    for entry in add_deposits:
        account = entry["account"]
        bdv = int(entry["bdv"])
        if account in qualified_accounts_stats:
            qualified_accounts_stats[account] = [qualified_accounts_stats[account][0] + 1, qualified_accounts_stats[account][1] + bdv]
        else:
            qualified_accounts_stats[account] = [1 , bdv]
    
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
            qualified_accounts_stats[account][1] -= account_bdv_removed[account] 
    return qualified_accounts_stats


qualified_account_stats, add_deposits = construct_account_dict()
final_dict = filter_qualified_accounts(qualified_account_stats)

total_nfts = 0
for account in final_dict:
    total_nfts += final_dict[account][0]
    if final_dict[account][0] > 0:
        print(account + " qualified for " + str(final_dict[account][0]) + " nfts with " + str(final_dict[account][1]) + " bdv deposited")
print("Total nfts: " + str(total_nfts))


