using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using localadmin.Models;
using System.Net.Http;
using static localadmin.Models.User;

namespace localadmin.Services
{
    public static class ApiUsersService
    {
        private static readonly HttpClient client = new HttpClient();
        private static readonly JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            IncludeFields = true,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
        };

        /// <summary>
        /// Ez a függvény lekéri az összes felhasználót az adatbázisból.
        /// </summary>
        /// <returns></returns>
        public static async Task<(ObservableCollection<User> Users, int TotalCount)> GetUsersAsync(int page, int pagesize)
        {
            string url = $"{SharedStateService.Instance.ApiURL}/all-users?page={page}&limit={pagesize}";
            client.DefaultRequestHeaders.Remove("X-Api-Key");
            client.DefaultRequestHeaders.Add("X-Api-Key", SharedStateService.Instance.ApiKey);

            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string jsonResponse = await response.Content.ReadAsStringAsync();

                using (JsonDocument doc = JsonDocument.Parse(jsonResponse))
                {
                    JsonElement root = doc.RootElement;
                    int totalCount = 0;
                    ObservableCollection<User> users = new();

                    if (root.TryGetProperty("data", out JsonElement dataElement))
                    { 
                        if (dataElement.TryGetProperty("totalCount", out JsonElement totalElement))
                        {
                            string? totalCountStr = totalElement.GetString();
                            if (int.TryParse(totalCountStr, out int parsedValue))
                                totalCount = parsedValue;
                        }

                        if (dataElement.TryGetProperty("users", out JsonElement usersElement) && usersElement.ValueKind == JsonValueKind.Array)
                            users = JsonSerializer.Deserialize<ObservableCollection<User>>(usersElement.GetRawText(), jsonSerializerOptions) ?? new();
                        else
                            Debug.WriteLine("Error: 'data.users' field missing or not an array.");
                    }

                    return (users, totalCount);
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error fetching users: {ex.Message}");
                return (new ObservableCollection<User>(), 0);
            }
        }


        /// <summary>
        /// Ez a függvény frissíti a felhasználó authentikációs státuszát.
        /// </summary>
        /// <param name="userUuid"></param>
        /// <param name="newStatus"></param>
        /// <returns></returns>

        public static async Task<bool> UpdateUserAuthStatus(string userUuid, EAuthStatus newStatus)
        {
            string url = $"{SharedStateService.Instance.ApiURL}/set/authstatus";
            client.DefaultRequestHeaders.Remove("X-Api-Key");
            client.DefaultRequestHeaders.Add("X-Api-Key", SharedStateService.Instance.ApiKey);

            var body = new
            {
                userId = userUuid,
                status = newStatus.ToString().ToLower()
            };

            string jsonPayload = JsonSerializer.Serialize(body);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await client.PostAsync(url, content);
                string responseText = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    Debug.WriteLine("User auth status updated successfully!");
                    return true;
                }
                else
                {
                    Debug.WriteLine($"Failed to update user auth status: {response.StatusCode}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error updating user auth status: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Ez a függvény frissíti a felhasználó aktivitási státuszát.
        /// </summary>
        /// <param name="userUuid"></param>
        /// <param name="newRole"></param>
        /// <returns></returns>
        public static async Task<bool> UpdateUserRole(string userUuid, string newRole)
        {
            string url = $"{SharedStateService.Instance.ApiURL}/set/role";
            client.DefaultRequestHeaders.Remove("X-Api-Key");
            client.DefaultRequestHeaders.Add("X-Api-Key", SharedStateService.Instance.ApiKey);

            var body = new
            {
                userId = userUuid,
                roleName = newRole.ToLower()
            };

            string jsonPayload = JsonSerializer.Serialize(body);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await client.PostAsync(url, content);
                string responseText = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    Debug.WriteLine("User role updated successfully!");
                    return true;
                }
                else
                {
                    Debug.WriteLine($"Failed to update user role: {response.StatusCode}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error updating user role {ex.Message}");
                return false;
            }
        }
    }
}