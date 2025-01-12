using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.ObjectModel;
using System.Windows.Data;
using FuzzySharp;

namespace localadmin
{
    public class UserViewModel : INotifyPropertyChanged
    {
        public ObservableCollection<User> Users { get; set; } = new ObservableCollection<User>();
        private ICollectionView _filteredUsers;

        public ICollectionView FilteredUsers
        {
            get => _filteredUsers;
            set
            {
                _filteredUsers = value;
                OnPropertyChanged(nameof(FilteredUsers));
            }
        }

        public UserViewModel()
        {
            Users = new ObservableCollection<User>
            {
                new User()
                {
                    Username = "Alice Smith",
                    Email = "alice@example.com",
                    Role = "Administrator"
                },
                new User()
                {
                    Username = "Bob Johnson",
                    Email = "bob@example.com",
                    Role = "Editor"
                },
                new User()
                {
                    Username = "Charlie Brown",
                    Email = "charlie@example.com",
                    Role = "Viewer"
                },
                new User()
                {
                    Username = "Diana Prince",
                    Email = "diana@example.com",
                    Role = "Editor"
                },
                new User()
                {
                    Username = "Edward Elric",
                    Email = "edward@example.com",
                    Role = "Viewer"
                }
            };

            FilteredUsers = CollectionViewSource.GetDefaultView(Users);
        }

        public void ApplyFilter(string searchQuery)
        {
            if (FilteredUsers == null) return;
            if (string.IsNullOrWhiteSpace(searchQuery) || searchQuery == "Search") FilteredUsers.Filter = null;

            FilteredUsers.Filter = user =>
            {
                if (user is User u)
                {
                    if (string.IsNullOrWhiteSpace(searchQuery))
                        return true;

                    int usernameScore = Fuzz.PartialRatio(searchQuery.ToLower(), u.Username.ToLower());
                    int emailScore = Fuzz.PartialRatio(searchQuery.ToLower(), u.Email.ToLower());

                    int similarityThreshold = 80;

                    return usernameScore >= similarityThreshold || emailScore >= similarityThreshold;
                }
                return false;
            };

            FilteredUsers.Refresh();
        }


        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged(string propertyName) =>
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
