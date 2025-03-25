using System;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.ObjectModel;
using Moq;
using Moq.Protected;
using Xunit;
using localadmin.Services;
using localadmin.Models;
using System.Text;

namespace localadmin.Tests
{
    public class ApiTest
    {
        private readonly Mock<HttpMessageHandler> _mockHttpHandler;
        private readonly HttpClient _httpClient;

        public ApiTest()
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
            var fakeUsers = new List<User>
            {
                new User { UUID = "1A", Username = "Alice", Email = "alice@example.com" },
                new User { UUID = "2B", Username = "Bob", Email = "bob@example.com" }
            };

            var fakeJsonResponse = JsonSerializer.Serialize(fakeUsers);

            _mockHttpHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.Is<HttpRequestMessage>(req =>
                        req.Method == HttpMethod.Get &&
                        req.RequestUri.ToString().Contains("users")),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(fakeJsonResponse, Encoding.UTF8, "application/json")
                });

            var httpClient = new HttpClient(_mockHttpHandler.Object);

            var result = await ApiUsersService.GetUsersAsync();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Contains(result, u => u.Username == "Alice");
            Assert.Contains(result, u => u.Username == "Bob");

            // Verify the API was actually called
            _mockHttpHandler
                .Protected()
                .Verify(
                    "SendAsync",
                    Times.Exactly(1),
                    ItExpr.Is<HttpRequestMessage>(req => req.Method == HttpMethod.Get),
                    ItExpr.IsAny<CancellationToken>());
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
