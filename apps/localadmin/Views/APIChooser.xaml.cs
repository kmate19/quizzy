using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;
using localadmin.Services;

namespace localadmin.Views
{
    /// <summary>
    /// Interaction logic for APIChooser.xaml
    /// </summary>
    public partial class APIChooser : Window
    {
        public APIChooser()
        {
            InitializeComponent();
            Debug.WriteLine("APIChooser loaded");
        }

        private void CheckBox_Checked(object sender, RoutedEventArgs e)
        {
            foreach (var child in CheckBoxPanel.Children)
            {
                if (child is CheckBox checkBox && checkBox != sender)
                {
                    checkBox.IsChecked = false;
                }
            }
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if ((bool)Checkbox1.IsChecked)
            {
                SharedStateService.Instance.ApiURL = "http://localhost:3000/api/v1/admin";
                DialogResult = true;

            }
            else if ((bool)Checkbox2.IsChecked)
            {
                SharedStateService.Instance.ApiURL = "https://quizzy.kmate.xyz/api/v1/admin";
                DialogResult = true;
            }
            else
            {
                MessageBox.Show("Kérlek válassz egy API-t.");
                return;
            }
        }
    }
}
