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
    public SharedStateService sharedState { get; } = SharedStateService.Instance;

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
            Debug.WriteLine($"CurrentView changed to: {value?.GetType().Name}");
        }
    }

    public MainWindow()
    {
        InitializeComponent();


        //1db shared state servicet kene hasznalni
        UserViewModel = new UserViewModel(NavigationService);
        ReviewViewModel = new ReviewViewModel(NavigationService);
        QuizViewModel = new QuizViewModel(NavigationService);

        NavigationService.ViewModelChanged += OnViewModelChanged;

        CurrentView = UserViewModel;

        DataContext = this;
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    protected void OnPropertyChanged(string propertyName)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    private void OnViewModelChanged(object newViewModel)
    {
        Debug.WriteLine($"Switching to: {newViewModel.GetType().Name}");
        CurrentView = newViewModel;
    }

    private void RedirectToMainPage(object sender, RoutedEventArgs e)
    {
        string url = "https://www.google.com";
        Process.Start(new ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
    }

    private void Searchbar_gotFocus(object sender, RoutedEventArgs e)
    {
        var textBox = sender as TextBox;
        if (textBox != null && textBox.Text == "Search")
        {
            textBox.Text = string.Empty;
        }
    }

    private void Searchbar_lostFocus(object sender, RoutedEventArgs e)
    {
        var textBox = sender as TextBox;
        if (textBox != null && textBox.Text == "")
        {
            textBox.Text = "Search";
        }
    }

    private void Searchbar_textChanged(object sender, TextChangedEventArgs e)
    {
        var textBox = sender as TextBox;
        if (textBox == null || textBox.Text == "Search") return;

        sharedState.SearchText = textBox.Text;

        if (CurrentView is UserViewModel userViewModel)
        {
            userViewModel.SearchUsers(sharedState.SearchText);
        }
        else if (CurrentView is ReviewViewModel reviewViewModel)
        {
            reviewViewModel.SearchReviews(sharedState.SearchText);
        }
        else if (CurrentView is QuizViewModel quizViewModel)
        {
            quizViewModel.SearchQuizes(sharedState.SearchText);
        }
    }

    private void UsersButton_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(UserViewModel);
    }

    private void Quizbutton_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(QuizViewModel);
    }

    private void ReviewsButtons_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.NavigateTo(ReviewViewModel);
    }
}