using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using localadmin.Models;
using localadmin.Services;

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

        public async Task GetUsers()
        {
            var fetchedUsers = await ApiUsersService.GetUsersAsync();
            Users.Clear();
            FilteredUsers.Clear();
            foreach (var user in fetchedUsers)
            {
                Users.Add(user);
                FilteredUsers.Add(user);
                user.UserUpdated += async () => await GetUsers();
                user.Initialize(NavigationService, SharedState);
            }
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
    }
}
