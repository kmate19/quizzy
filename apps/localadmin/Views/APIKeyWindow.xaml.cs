using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Permissions;
using System.Text;
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

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (TextBox.Text == "Fasz")
            {
                MainWindow.Show();
                Close();
            }
            else
                MessageBox.Show("Helytelen API kulcs. Kérlek próbálkozz újra.");
        }
    }
}
