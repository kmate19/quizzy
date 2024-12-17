using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace localadmin;

    public partial class MainWindow : Window
    {
        public ObservableCollection<User> Users { get; set; }
        public MainWindow()
        {
            InitializeComponent();

            Users = new ObservableCollection<User>
            {
                new User()
                {
                    Name = "Alice Smith",
                    Email = "alice@example.com",
                    Role = "Administrator"
                },
                new User()
                {
                    Name = "Bob Johnson",
                    Email = "bob@example.com",
                    Role = "Editor"
                },
                new User()
                {
                    Name = "Charlie Brown",
                    Email = "charlie@example.com",
                    Role = "Viewer"
                },
                new User()
                {
                    Name = "Diana Prince",
                    Email = "diana@example.com",
                    Role = "Editor"
                },
                new User()
                {
                    Name = "Edward Elric",
                    Email = "edward@example.com",
                    Role = "Viewer"
                }
            };


            DataContext = this;
        }

        private void RedirectToMainPage(object sender, RoutedEventArgs e)
        {   /*
            string url = "https://www.google.com";
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
            */

            string url = "https://www.google.com";
            WebBrowser wb = new WebBrowser();
            wb.Navigate(new Uri(url));
        }
    }

    public class User
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }

        public User()
        {
        }
    }
