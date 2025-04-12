using System.Collections.ObjectModel;
using localadmin.Models;
using localadmin.Services;
using System.Windows;
using System.Diagnostics;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using System.Windows.Threading;

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
        private DispatcherTimer _refreshTimer;
        public ObservableCollection<int> PageSizeOptions { get; }
        public ICommand PreviousPageCommand { get; }
        public ICommand NextPageCommand { get; }
        public bool CanGoPrevious => CurrentPage > 1;
        public bool CanGoNext => maxPage > CurrentPage;
        public int maxPage;

        private int _currentPage = 1;
        private int _PageSize = 10;

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

        public int CurrentPage
        {
            get => _currentPage;
            set
            {
                _currentPage = value;
                OnPropertyChanged();
            }
        }

        public int PageSize
        {
            get => _PageSize;
            set
            {
                if (_PageSize != value)
                {
                    _PageSize = value;
                    OnPropertyChanged(nameof(PageSize));

                    _ = PageSizeChanged();
                }
            }
        }

        public UserViewModel(NavigationService Navigation)
        {
            NavigationService = Navigation;
            SharedState = SharedStateService.Instance;

            PreviousPageCommand = new RelayCommand(PreviousPage);
            NextPageCommand = new RelayCommand(NextPage);

            PageSizeOptions = new ObservableCollection<int> { 10, 20, 30, 40, 50 };
            PageSize = PageSizeOptions[0];

            _refreshTimer = new DispatcherTimer
            {
                Interval = TimeSpan.FromSeconds(30)
            };
            _refreshTimer.Tick += async (sender, e) => await GetUsers();
            _refreshTimer.Start();
        }
        public async Task InitializeAsync()
        {
            await GetUsers();
        }

        private async Task PageSizeChanged()
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
            var fetchedUsers = await ApiUsersService.GetUsersAsync(CurrentPage, PageSize);
            var usersList = new List<User>();
            var filteredList = new List<User>();

            foreach (var user in fetchedUsers.Users)
            {
                user.Initialize(NavigationService);
                user.UserUpdated += async () => await GetUsers();
                user.Winrate = user.Stats.Plays == 0 || !user.Stats.Plays.HasValue || !user.Stats.FirstPlaces.HasValue ? 0 : ((double)user.Stats.FirstPlaces.Value / user.Stats.Plays.Value) * 100;

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

            maxPage = (int)Math.Ceiling((double)fetchedUsers.TotalCount / PageSize);

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

        /// <summary>
        /// Visszalép az elpőző oldalra és frissíti az adatokat.
        /// </summary>
        /// <param name="parameter"></param>
        private async void PreviousPage(object parameter)
        {
            if (CanGoPrevious)
            {
                CurrentPage--;
                OnPropertyChanged(nameof(CurrentPage));
                OnPropertyChanged(nameof(CanGoNext));
                await GetUsers();
            }
        }

        /// <summary>
        /// Átlép a következő oldalra és frissíti az adatokat.
        /// </summary>
        /// <param name="parameter"></param>
        private async void NextPage(object parameter)
        {
            if (CanGoNext)
            {
                CurrentPage++;
                OnPropertyChanged(nameof(CurrentPage));
                OnPropertyChanged(nameof(CanGoPrevious));
                await GetUsers();
            }
            else
                MessageBox.Show("Nincs további oldal.");
        }

        public event PropertyChangedEventHandler ?PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}