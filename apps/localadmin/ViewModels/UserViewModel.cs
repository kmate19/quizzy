using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using localadmin.Models;
using localadmin.Services;
using static localadmin.Models.User;

namespace localadmin.ViewModels
{
    public class UserViewModel
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;
        public ObservableCollection<User> Users { get; set; } = new ObservableCollection<User>();
        public ObservableCollection<User> FilteredUsers { get; private set; }

        public UserViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService = Navigation;
            SharedState = State;

            Users = new ObservableCollection<User>
            {
                new User(NavigationService, SharedState)
                {
                    UUID = "f5e6a25f-8b92-441d-b58d-c3d5dbde2c0e",
                    Username = "john_doe",
                    Email = "john.doe@email.com",
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
                    ActivityStatus = EActivityStatus.Inactive,
                    AuthStatus = EAuthStatus.Blocked,
                    CreatedAt = DateTime.UtcNow.AddMonths(-12),
                    UpdatedAt = DateTime.UtcNow.AddMonths(-2)
                    }

            };

            FilteredUsers = new ObservableCollection<User>(Users);
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
