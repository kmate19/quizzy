﻿using System.Diagnostics;
using System.Windows;
using localadmin.Models;
using static localadmin.Models.User;
using localadmin.Services;
using System.ComponentModel;

namespace localadmin.Views
{
    /// <summary>
    /// Ebben az ablakban lehet felhasználókat módosítani.
    /// </summary>
    public partial class EditUserWindow : Window
    {
        public class SelectableItem<T> : INotifyPropertyChanged
        {
            private bool _isSelected;

            public T Value { get; set; }
            public string Description { get; set; } = string.Empty;
            public bool IsLocked { get; set; }

            public bool IsSelected
            {
                get => _isSelected;
                set
                {
                    if (_isSelected != value)
                    {
                        _isSelected = value;
                        OnPropertyChanged(nameof(IsSelected));
                        if (value)
                        {
                            SelectionChanged?.Invoke(this, EventArgs.Empty);
                        }
                    }
                }
            }

            public event PropertyChangedEventHandler? PropertyChanged;
            protected void OnPropertyChanged(string name) =>
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

            public event EventHandler? SelectionChanged;
        }


        public List<SelectableItem<string>> AllRoles { get; }
        public List<SelectableItem<string>> AllStatuses { get; }
        public string Username { get; set; }
        public User CurrentUser { get; set; }

        public EditUserWindow(User user)
        {
            InitializeComponent();
            CurrentUser = user;
            Username = user.Username;

            AllRoles = new List<SelectableItem<string>>
            {
                new SelectableItem<string> { Value = "default", Description="Alap jogosultság", IsSelected = false, IsLocked=false},
                new SelectableItem<string> { Value = "admin", Description="Módosíthatja a felhasználókat illetve a quizeket." ,IsSelected = false, IsLocked = false}
            };

            /// <summary>
            /// Itt szükséges az InvertBooleanConverter, hogy ne tudjuk levenni a már meglévő jogosultságot.
            /// </summary>
            for (int i = 0; i < user?.Roles.Count; i++)
            {
                for(int j=0; j < AllRoles.Count; j++)
                {
                    if (user?.Roles[i]?.Role?.Name == AllRoles[j].Value)
                    {
                        AllRoles[j].IsSelected = true;
                        AllRoles[j].IsLocked = true;
                    }
                }
            }

            /// <summary>
            /// Itt automatikusan kiválaszjuk azt a státuszt, ami a felhasználónak van.
            /// </summary>
            AllStatuses = Enum.GetNames(typeof(EAuthStatus))
                .Select(status =>
                {
                    var item = new SelectableItem<string>
                    {
                        Value = status,
                        IsSelected = user?.AuthStatus.ToString() == status
                    };
                    item.SelectionChanged += OnStatusSelected;
                    return item;
                })
                .ToList();


            DataContext = this;
        }

        /// <summary>
        /// Itt ellenőrizzük, hogy csak egy státusz legyen kiválasztva.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void OnStatusSelected(object? sender, EventArgs e)
        {
            var selectedItem = sender as SelectableItem<string>;

            foreach (var item in AllStatuses)
            {
                if (!ReferenceEquals(item, selectedItem))
                {
                    item.IsSelected = false;
                }
            }
        }


        private void Cancel(object sender, RoutedEventArgs e)
        {
            Hide();
        }

        private async void Modify(object sender, RoutedEventArgs e)
        {
            if (AllStatuses.Count(x => x.IsSelected) > 1)
            {
                MessageBox.Show("Csak 1 státusza lehet!");
                return;
            }

            await UpdateUserStatus();
            await UpdateUserRole();
        }

        /// <summary>
        /// Ez a függvény frissíti a felhasználó státuszát.
        /// </summary>
        private async Task UpdateUserStatus()
        {
            var selectedStatus = AllStatuses.FirstOrDefault(s => s.IsSelected)?.Value;
            if(selectedStatus == null)
                return;

            if (Enum.TryParse(selectedStatus, out EAuthStatus newStatus))
            {   
                if (CurrentUser.AuthStatus != newStatus)
                {
                    bool success = await ApiUsersService.UpdateUserAuthStatus(CurrentUser.UUID, newStatus);
                    if (success)
                    {
                        MessageBox.Show("Felhasználó státusza sikeresen módosítva!");
                        CurrentUser.OnUserUpdated();
                        Hide();
                    }
                }
                else
                    Debug.WriteLine("Auth status is unchanged. No API call made.");
            }
            else
                Debug.WriteLine("No valid status selected.");
        }

        /// <summary>
        /// Ez a függvény frissíti a felhasználó jogosultságát.
        /// </summary>
        /// <returns></returns>
        private async Task UpdateUserRole()
        {
            var selectedRole = AllRoles.FirstOrDefault(r => !r.IsLocked && r.IsSelected)?.Value;

            if (selectedRole == null)
            {
                Debug.WriteLine("No valid role selected. Skipping API call.");
                return;
            }

            if (selectedRole == "admin")
            {
                PopUpModal dialog = new PopUpModal("Biztosan adminná szeretnéd tenni ezt a felhasználót?");
                if (dialog.ShowDialog() == false)
                    return;
            }

            bool success = await ApiUsersService.UpdateUserRole(CurrentUser.UUID, selectedRole);
            if (success)
            {
                MessageBox.Show("Felhasználó jogosultsága sikeresen módosítva!");
                CurrentUser.OnUserUpdated();
                Hide();
            }
        }
    }
}