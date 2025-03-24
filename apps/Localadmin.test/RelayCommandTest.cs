using localadmin.Models;
using Xunit;

namespace Localadmin.test
{
    public class RelayCommandTest
    {
        [Fact]
        public void UserRelayCommandTest()
        {
            User user = new User();
            user.EditUserCommand.CanExecute(null);
            user.ViewQuizCommand.CanExecute(null);
        }
        [Fact]
        public void QuizRelayCommandTest()
        {
            Quiz quiz = new Quiz();
            quiz.ViewQuizCommand.CanExecute(null);
            quiz.ViewUserCommand.CanExecute(null);
        }
    }
}