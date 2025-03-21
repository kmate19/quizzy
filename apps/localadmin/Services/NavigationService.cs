namespace localadmin.Services
{
    public class NavigationService
    {
        public event Action<object> ?ViewModelChanged;

        public void NavigateTo(object viewModel)
        {
            ViewModelChanged?.Invoke(viewModel);
        }
    }
}
