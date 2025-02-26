using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using localadmin.Models;
using localadmin.Services;
using static localadmin.Models.User;

namespace localadmin.ViewModels
{
    public class UserViewModel
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;
        public ObservableCollection<User> Users { get; set; } = new();
        public ObservableCollection<User> FilteredUsers { get; private set; }

        public UserViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService = Navigation;
            SharedState = State;

            GetUsers();

            /*
            Users = new ObservableCollection<User>
            {
                new User(NavigationService, SharedState)
                {
                    UUID = "f5e6a25f-8b92-441d-b58d-c3d5dbde2c0e",
                    Username = "john_doe",
                    Email = "john.doe@email.com",
                    Roles=new List<Roles> { Roles.AllRoles[0], Roles.AllRoles[1] },
                    ActivityStatus = EActivityStatus.Active,
                    AuthStatus = EAuthStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6),
                    UpdatedAt = DateTime.UtcNow
                },
                new User(NavigationService, SharedState)
                {
                    UUID = "d3d77b3a-d671-45b0-88c7-b9a6d7b98c68",
                    Username = "jane_smith",
                    Email = "jane.smith@email.com",
                    Roles=new List<Roles> { Roles.AllRoles[2] },
                    ActivityStatus = EActivityStatus.Away,
                    AuthStatus = EAuthStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow
                },
                new User(NavigationService, SharedState)
                {
                    UUID = "ccf473a2-92ba-42b7-9444-98013b495ef4",
                    Username = "mike_jones",
                    Email = "mike.jones@email.com",
                    Roles=new List<Roles>{Roles.AllRoles[0]},
                    ActivityStatus = EActivityStatus.Inactive,
                    AuthStatus = EAuthStatus.Blocked,
                    CreatedAt = DateTime.UtcNow.AddMonths(-12),
                    UpdatedAt = DateTime.UtcNow.AddMonths(-2)
                    },
                new User(NavigationService, SharedState)
                {
                    UUID = "f5e6a25f-8b92-441d-b58d-c3d5dbde2c0e",
                    Username = "john_doe",
                    Email = "john.doe@email.com",
                    Roles=new List<Roles>{Roles.AllRoles[3]},
                    ActivityStatus = EActivityStatus.Active,
                    AuthStatus = EAuthStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6),
                    UpdatedAt = DateTime.UtcNow
                },
                new User(NavigationService, SharedState)
                {
                    UUID = "d3d77b3a-d671-45b0-88c7-b9a6d7b98c68",
                    Username = "jane_smith",
                    Email = "jane.smith@email.com",
                    Roles=new List<Roles>{Roles.AllRoles[4]},
                    ActivityStatus = EActivityStatus.Away,
                    AuthStatus = EAuthStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow
                },
                new User(NavigationService, SharedState)
                {
                    UUID = "ccf473a2-92ba-42b7-9444-98013b495ef4",
                    Username = "mike_jones",
                    Email = "mike.jones@email.com",
                    Roles=new List<Roles>{Roles.AllRoles[1]},
                    ActivityStatus = EActivityStatus.Inactive,
                    AuthStatus = EAuthStatus.Blocked,
                    CreatedAt = DateTime.UtcNow.AddMonths(-12),
                    UpdatedAt = DateTime.UtcNow.AddMonths(-2)
                    }
            };
            */
        }

        public  async Task GetUsers()
        {
            var fetchedUsers = await ApiUsersService.GetUsersAsync();
            Users.Clear();
            foreach (var user in fetchedUsers)
            {
                Users.Add(user);
            }
            FilteredUsers = new ObservableCollection<User>(Users);

            OnPropertyChanged(nameof(Users));
            OnPropertyChanged(nameof(FilteredUsers));
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
