using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Permissions;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace localadmin.Views
{
    public partial class APIKeyWindow : Window
    {
        private MainWindow MainWindow;

        public APIKeyWindow(MainWindow mainWindow)
        {
            InitializeComponent();
            MainWindow = mainWindow;
        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            string apiKey = TextBox.Text;

            if (await AuthenticateApiKey(apiKey))
            {
                MainWindow mainWindow = new MainWindow();
                Application.Current.MainWindow = mainWindow;
                mainWindow.Show();
                this.Hide();
            }
            else
            {
                MessageBox.Show("Helytelen API kulcs. Kérlek próbálkozz újra.");
            }
        }

        private async Task<bool> AuthenticateApiKey(string apiKey)
        {
            string url = "http://localhost:3000/api/v1/admin/authenticate";

            using HttpClient client = new HttpClient();
            var requestBody = new { api_key = apiKey };
            string json = JsonSerializer.Serialize(requestBody);

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await client.PostAsync(url, content);
                if (!response.IsSuccessStatusCode) return false;

                string responseString = await response.Content.ReadAsStringAsync();
                var responseData = JsonSerializer.Deserialize<Dictionary<string, string>>(responseString);

                return responseData != null && responseData.ContainsKey("success") && responseData["success"] == "true";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Hiba történt az API ellenőrzése közben: {ex.Message}");
                return false;
            }
        }

        protected override void OnClosed(EventArgs e)
        {
            base.OnClosed(e);
            Application.Current.Shutdown();
        }
    }
}
