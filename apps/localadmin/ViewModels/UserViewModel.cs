using System.Collections.ObjectModel;
using localadmin.Models;
using localadmin.Services;
using System.Windows;

namespace localadmin.ViewModels
{
    public class UserViewModel
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;
        public ObservableCollection<User> Users { get; set; } = new();
        public ObservableCollection<User> FilteredUsers { get; set; } = new();

        public UserViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService = Navigation;
            SharedState = State;

            _ = InitializeAsync();

        }
        public async Task InitializeAsync()
        {
            await GetUsers();
            SearchUsers("");
        }

        public async Task GetUsers()
        {
            var fetchedUsers = await ApiUsersService.GetUsersAsync();

            var usersList = new List<User>();
            var filteredList = new List<User>();

            foreach (var user in fetchedUsers)
            {
                user.Initialize(NavigationService, SharedState);
                user.UserUpdated += async () => await GetUsers();

                usersList.Add(user);
                filteredList.Add(user);
            }

            await Application.Current.Dispatcher.InvokeAsync(() =>
            {
                Users.Clear();
                foreach (var user in usersList)
                {
                    Users.Add(user);
                }

                FilteredUsers.Clear();
                foreach (var user in filteredList)
                {
                    FilteredUsers.Add(user);
                }

                SearchUsers("");
            });
        }

        public void SearchUsers(string query)
        {
            var results = SearchService.FuzzySearch(Users, query, user => [user.Username, user.Email]);

            // Use the Dispatcher to ensure UI updates happen on the UI thread
            Application.Current.Dispatcher.Invoke(() =>
            {
                FilteredUsers.Clear();
                foreach (var user in results)
                {
                    FilteredUsers.Add(user);
                }
            });
        }
    }
}
