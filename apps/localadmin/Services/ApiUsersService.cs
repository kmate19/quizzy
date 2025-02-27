using System.Collections.ObjectModel;
using System.Data;
using System.Diagnostics;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using localadmin.Models;
using localadmin.Services;

namespace localadmin.Services
{
    internal class ApiUsersService
    {
        private static readonly HttpClient client = new HttpClient();
        private static readonly JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            IncludeFields = true,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
        };

        public static async Task<ObservableCollection<User>> GetUsersAsync()
        {
            string url = "http://localhost:3000/api/v1/admin/all-users";
            client.DefaultRequestHeaders.Remove("X-Api-Key");
            client.DefaultRequestHeaders.Add("X-Api-Key", SharedStateService.Instance.ApiKey);

            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string jsonResponse = await response.Content.ReadAsStringAsync();
                Debug.WriteLine($"Raw JSON Response: {jsonResponse}");

                using (JsonDocument doc = JsonDocument.Parse(jsonResponse))
                {
                    JsonElement root = doc.RootElement;

                    if (root.TryGetProperty("data", out JsonElement dataElement) &&
                        dataElement.TryGetProperty("users", out JsonElement usersElement) &&
                        usersElement.ValueKind == JsonValueKind.Array)
                    {
                        var users = JsonSerializer.Deserialize<ObservableCollection<User>>(usersElement.GetRawText(), jsonSerializerOptions)
                                   ?? new ObservableCollection<User>();

                        return users;
                    }
                    else
                    {
                        Debug.WriteLine("Error: 'data.users' field missing or not an array.");
                    }
                }

                return new ObservableCollection<User>();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error fetching users: {ex.Message}");
                return new ObservableCollection<User>();
            }
        }


    }

}
