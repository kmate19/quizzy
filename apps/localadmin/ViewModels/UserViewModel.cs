using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using localadmin.Models;
using localadmin.Services;
using Microsoft.VisualBasic.Logging;
using static localadmin.Models.User;

namespace localadmin.ViewModels
{
    public class UserViewModel
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;
        public ObservableCollection<User> Users { get; set; } = new();
        public ObservableCollection<User> FilteredUsers { get; private set; } = new();

        public UserViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService = Navigation;
            SharedState = State;

            _ = InitializeAsync();

        }
        public async Task InitializeAsync()
        {
            await GetUsers();
        }

        public  async Task GetUsers()
        {
            var fetchedUsers = await ApiUsersService.GetUsersAsync();
            Users.Clear();
            FilteredUsers.Clear();
            foreach (var user in fetchedUsers)
            {
                Users.Add(user);
                FilteredUsers.Add(user);
                user.Initialize(NavigationService, SharedState);
            }

            OnPropertyChanged(nameof(Users));
            OnPropertyChanged(nameof(FilteredUsers));

            Debug.WriteLine($"Fetched {Users.Count} users.");
        }

        public void SearchUsers(string query)
        {
            var results = SearchService.FuzzySearch(Users, query, user => [user.Username, user.Email]);
            FilteredUsers.Clear();
            foreach (var user in results)
            {
                FilteredUsers.Add(user);
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

    }
}
