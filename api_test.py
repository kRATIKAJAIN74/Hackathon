import requests

url = "http://cosylab.iiitd.edu.in:6969/recipe2-api/recipe/recipesinfo?page=1&limit=10"

# Use the Bearer token exactly as Postman shows it
headers = {
    "Authorization": "Bearer oiu953TOintm04XRvIbo7zme8NpLI3B3VCHxaoObc4MPLjj9",
    "Content-Type": "application/json"
}

response = requests.get(url, headers=headers)

print("Status Code:", response.status_code)
print("Response Text:", response.text)

try:
    data = response.json()
    print("JSON Data:", data)
except Exception as e:
    print("Could not parse JSON:", e)