using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Security.RightsManagement;
using System.Windows;
using localadmin.Models;
using static localadmin.Models.User;

namespace localadmin.Views
{
    public partial class EditUserWindow : Window
    {
        public class SelectableItem<T>
        {
            public T Value { get; set; }
            public bool IsSelected { get; set; }
        }
        public List<SelectableItem<string>> AllRoles { get; }
        public List<SelectableItem<string>> AllStatuses { get; }
        public string Username { get; set; }
        public User User { get; set; }

        public EditUserWindow(User user)
        {
            InitializeComponent();
            User = user;
            Username = user.Username;

            AllRoles = Roles.AllRoles
                .Select(r => new SelectableItem<string>
                {
                    Value = r.Name,
                    IsSelected = user.Roles.Contains(r)
                })
                .ToList();

            AllStatuses = Enum.GetNames(typeof(User.EAuthStatus))
                .Select(status => new SelectableItem<string>
                {
                    Value = status,
                    IsSelected = user.AuthStatus.ToString() == status
                })
                .ToList();

            DataContext = this;
        }
        private void Cancel(object sender, RoutedEventArgs e)
        {
            Hide();
        }

        private void Modify(object sender, RoutedEventArgs e)
        {
            if (AllStatuses.Count(x => x.IsSelected) > 1)
                MessageBox.Show("Csak 1 státusza lehet!");
            else
            {
                var selectedStatus = AllStatuses.FirstOrDefault(x => x.IsSelected)?.Value;

                Debug.WriteLine(selectedStatus);
                if (!string.IsNullOrEmpty(selectedStatus) && Enum.TryParse(selectedStatus, out EAuthStatus parsedStatus))
                    User.AuthStatus = parsedStatus;

                MessageBox.Show("Felhasználó módosítva");
                Hide();
            }
        }
    }
}
