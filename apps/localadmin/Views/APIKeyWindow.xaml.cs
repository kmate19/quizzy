using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
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
        private static readonly HttpClient client = new HttpClient();


        public APIKeyWindow(MainWindow mainWindow)
        {
            InitializeComponent();
            MainWindow = mainWindow;
        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            string apiKey = TextBox.Text.Trim();

            var button = sender as Button;
            if (button != null) 
                button.IsEnabled = false;

            if (await AuthenticateApiKey(apiKey))
            {
                Dispatcher.Invoke(() =>
                {
                    MainWindow mainWindow = new MainWindow();
                    Application.Current.MainWindow = mainWindow;
                    mainWindow.Show();
                    Close();
                });
            }
            else
            {
                MessageBox.Show("Helytelen API kulcs. Kérlek próbálkozz újra.");
            }

            // Re-enable the button after the request completes
            if (button != null) 
                button.IsEnabled = true;
        }

        private async Task<bool> AuthenticateApiKey(string apiKey)
        {
            string url = "http://localhost:3000/api/v1/admin/authenticate";

            client.DefaultRequestHeaders.Remove("X-Api-Key");
            client.DefaultRequestHeaders.Add("X-Api-Key", apiKey);
            Debug.WriteLine("sending api key: " + apiKey);
            try
            {
                HttpResponseMessage response = await client.GetAsync(url);
                Debug.WriteLine($"Response: {response}");

                string responseContent = await response.Content.ReadAsStringAsync();
                Debug.WriteLine(responseContent);

                var responseData = JsonSerializer.Deserialize<Dictionary<string, string>>(responseContent);
                Debug.WriteLine($"ResponseData: {responseData}");

                return responseData != null &&
                       responseData.TryGetValue("success", out string? success) &&
                       success.Equals("true", StringComparison.OrdinalIgnoreCase);
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);    
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
