using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using localadmin.ViewModels;
using System.Diagnostics;
using localadmin.Services;

namespace localadmin;

public partial class MainWindow : Window, INotifyPropertyChanged
{
    public NavigationService NavigationService { get; } = new NavigationService();
    public SharedStateService SharedState { get; } = SharedStateService.Instance;
    public UserViewModel UserViewModel { get; }
    public ReviewViewModel ReviewViewModel { get; }
    public QuizViewModel QuizViewModel { get; }

    private object _currentView = null!;

    public object CurrentView
    {
        get => _currentView;
        set
        {
            _currentView = value;
            OnPropertyChanged(nameof(CurrentView));
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    public MainWindow()
    {
        InitializeComponent();

        UserViewModel = new UserViewModel(NavigationService, SharedState);
        ReviewViewModel = new ReviewViewModel(NavigationService, SharedState);
        QuizViewModel = new QuizViewModel(NavigationService, SharedState);

        NavigationService.ViewModelChanged += OnViewModelChanged;

        CurrentView = UserViewModel;

        DataContext = this;
    }

    private void OnViewModelChanged(object newViewModel)
    {
        CurrentView = newViewModel;
    }

    private void RedirectToMainPage(object sender, RoutedEventArgs e)
    {
        string url = "https://www.google.com";
        Process.Start(new ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
    }

    private void Searchbar_gotFocus(object sender, RoutedEventArgs e)
    {
        if (sender is TextBox textBox && textBox.Text == "Search")
        {
            SharedState.SearchText = "";
        }
    }

    private void Searchbar_lostFocus(object sender, RoutedEventArgs e)
    {
        if (sender is TextBox textBox)
        {
            SharedState.SearchText = "Search";
        }
    }

    private void Searchbar_textChanged(object sender, TextChangedEventArgs e)
    {
        if (sender is not TextBox textBox) return;

        switch (CurrentView)
        {
            case UserViewModel userViewModel:
                userViewModel.SearchUsers(SharedState.SearchText);
                break;
            case ReviewViewModel reviewViewModel:
                reviewViewModel.SearchReviews(SharedState.SearchText);
                break;
            case QuizViewModel quizViewModel:
                quizViewModel.SearchQuizes(SharedState.SearchText);
                break;
        }
    }

    private void UsersButton_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(UserViewModel);
        SharedState.SearchText = "Search";
        QuizViewModel.SearchQuizes("");
    }

    private void Quizbutton_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(QuizViewModel);
        SharedState.SearchText = "Search";
        QuizViewModel.SearchQuizes("");
    }

    private void ReviewsButtons_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(ReviewViewModel);
        SharedState.SearchText = "Search";
        QuizViewModel.SearchQuizes("");
    }
}