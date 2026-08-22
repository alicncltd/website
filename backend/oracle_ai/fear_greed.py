import requests

url = "https://api.alternative.me/fng/"

response = requests.get(url, timeout=10)

data = response.json()["data"][0]

value = int(data["value"])
classification = data["value_classification"]