using System.Collections.ObjectModel;
using localadmin.Models;
using localadmin.Services;
using System.Windows;
using System.Diagnostics;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace localadmin.ViewModels
{
    /// <summary>
    /// A UserViewModel a felhasználói adatok kezeléséért felelős.
    /// </summary>
    public class UserViewModel : INotifyPropertyChanged
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;
        public ObservableCollection<User> Users { get; set; } = new();
        public ObservableCollection<User> FilteredUsers { get; set; } = new();

        private bool _isLoading;
        public bool IsLoading
        {
            get => _isLoading;
            set
            {
                _isLoading = value;
                OnPropertyChanged();
            }
        }

        public UserViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService = Navigation;
            SharedState = State;
        }
        public async Task InitializeAsync()
        {
            await GetUsers();
        }

        /// <summary>
        /// Ez a függvény lekéri az összes felhasználót az adatbázisból.
        /// </summary>
        /// <returns></returns>
        public async Task GetUsers()
        {
            IsLoading = true;
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

            });

            IsLoading = false;
        }

        /// <summary>
        /// Ez a függvény keresi a felhasználókat a felhasználók között, felhasználónév vagy email cím alapján.
        /// </summary>
        /// <param name="query"></param>
        public void SearchUsers(string query)
        {
            var results = SearchService.FuzzySearch(Users, query, user => [user.Username, user.Email]);

            FilteredUsers.Clear();
            foreach (var user in results)
            {
                FilteredUsers.Add(user);
            }
        }

        public event PropertyChangedEventHandler ?PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}