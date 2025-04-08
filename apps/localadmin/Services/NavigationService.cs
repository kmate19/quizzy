namespace localadmin.Services
{
    /// <summary>
    /// Ez az osztály felelős a ViewModel váltásért.
    /// </summary>

    public class NavigationService
    {
        public event Action<object> ?ViewModelChanged;

        public void NavigateTo(object viewModel)
        {
            ViewModelChanged?.Invoke(viewModel);
        }
    }
}