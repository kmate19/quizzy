using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using localadmin.Models;

namespace localadmin.Services
{
    internal class ApiUsersService
    {
        private static readonly HttpClient client = new HttpClient();
        private static readonly JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        public static async Task<ObservableCollection<User>> GetUsersAsync()
        {
            string url = "http://localhost:3000/api/v1/users"; // Change URL if needed
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                response.EnsureSuccessStatusCode();

                string jsonResponse = await response.Content.ReadAsStringAsync();
                ObservableCollection<User>? users = JsonSerializer.Deserialize<ObservableCollection<User>>(jsonResponse, jsonSerializerOptions);

                return users ?? new ObservableCollection<User>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching users: {ex.Message}");
                return new ObservableCollection<User>();
            }
        }
    }
}
