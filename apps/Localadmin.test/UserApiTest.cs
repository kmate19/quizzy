using System.Net;
using System.Text.Json;
using System.Collections.ObjectModel;
using Moq;
using Moq.Protected;
using Xunit;
using localadmin.Services;
using localadmin.Models;

namespace Localadmin.test
{
    public class UserApiTest
    {
        private readonly Mock<HttpMessageHandler> _mockHttpHandler;
        private readonly HttpClient _httpClient;

        public UserApiTest()
        {
            _mockHttpHandler = new Mock<HttpMessageHandler>();

            _httpClient = new HttpClient(_mockHttpHandler.Object)
            {
                BaseAddress = new Uri("http://localhost:3000/api/v1/admin/")
            };
        }

        [Fact]
        public async Task GetUsersAsync_ReturnsUserList_WhenApiCallIsSuccessful()
        {
            SharedStateService.Instance.ApiKey = "TestApiKey123";

            var fakeUsers = new ObservableCollection<User>
            {
                new User { UUID = "1A", Username = "Alice", Email = "alice@example.com" },
                new User { UUID = "2B", Username = "Bob", Email = "bob@example.com" }
            };

            var fakeJsonResponse = JsonSerializer.Serialize(new { data = new { users = fakeUsers } });

            _mockHttpHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req =>
                        req.Headers.Contains("X-Api-Key") &&
                        req.Headers.GetValues("X-Api-Key").FirstOrDefault() == "TestApiKey123"
                    ),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(fakeJsonResponse)
                });

            var result = await ApiUsersService.GetUsersAsync();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Contains(result, u => u.Username == "Alice");
            Assert.Contains(result, u => u.Username == "Bob");
        }



        [Fact]
        public async Task GetUsersAsync_ReturnsEmptyList_WhenApiCallFails()
        {
            _mockHttpHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.InternalServerError
                });

            var result = await ApiUsersService.GetUsersAsync();

            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
