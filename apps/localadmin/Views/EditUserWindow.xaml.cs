using System.ComponentModel;
using System.Linq;
using System.Windows;
using localadmin.Models;

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

        public EditUserWindow(User user)
        {
            InitializeComponent();
            Username = user.Username;

            // Mark roles the user already has as selected
            AllRoles = Roles.AllRoles
                .Select(r => new SelectableItem<string>
                {
                    Value = r.Name,
                    IsSelected = user.Roles.Contains(r)
                })
                .ToList();

            // Mark statuses the user already has as selected
            AllStatuses = Enum.GetNames(typeof(User.EAuthStatus))
                .Select(status => new SelectableItem<string>
                {
                    Value = status,
                    IsSelected = user.AuthStatus.ToString() == status
                })
                .ToList();

            DataContext = this;
        }
    }
}
