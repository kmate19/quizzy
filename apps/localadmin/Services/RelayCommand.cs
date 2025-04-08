using System.Windows.Input;

/// <summary>
/// Egy általános parancsosztály, amely a(z) MVVM (Model-View-Viewmodel) mintában gombokhoz és más vezérlőkhöz tartozó műveleteket kezeli.
/// </summary>
/// <remarks>
/// A RelayCommand lehetővé teszi a parancsok delegálását a UI és a ViewModel között.
/// Használható gombok és más vezérlők engedélyezésére vagy tiltására is a "CanExecute" metódussal.
/// </remarks>
public class RelayCommand : ICommand
{
    private readonly Action<object> _execute;
    private readonly Func<object, bool> _canExecute;

    public RelayCommand(Action<object> execute, Func<object, bool> canExecute = null)
    {
        _execute = execute ?? throw new ArgumentNullException(nameof(execute));
        _canExecute = canExecute;
    }

    public bool CanExecute(object parameter) => _canExecute == null || _canExecute(parameter);

    public void Execute(object parameter) => _execute(parameter);

    public event EventHandler CanExecuteChanged
    {
        add => CommandManager.RequerySuggested += value;
        remove => CommandManager.RequerySuggested -= value;
    }
}