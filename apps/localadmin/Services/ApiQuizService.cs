using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using localadmin.Models;
using localadmin.Services;
using static localadmin.Models.Quiz;

public static class ApiQuizzesService
{
    private static readonly HttpClient client = new HttpClient();
    private static readonly JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        IncludeFields = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public static async Task<ObservableCollection<Quiz>> GetQuizzesAsync(int page, int limit = 20)
    {
        string url = $"http://localhost:3000/api/v1/quizzes?page={page}&limit={limit}";
        client.DefaultRequestHeaders.Remove("X-Api-Key");
        client.DefaultRequestHeaders.Add("X-Api-Key", SharedStateService.Instance.ApiKey);

        try
        {
            HttpResponseMessage response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            string jsonResponse = await response.Content.ReadAsStringAsync();

            using (JsonDocument doc = JsonDocument.Parse(jsonResponse))
            {
                JsonElement root = doc.RootElement;

                if (root.TryGetProperty("data", out JsonElement dataElement) &&
                    dataElement.TryGetProperty("quizzes", out JsonElement quizzesElement) &&
                    quizzesElement.ValueKind == JsonValueKind.Array)
                {
                    var quizzes = JsonSerializer.Deserialize<ObservableCollection<Quiz>>(quizzesElement.GetRawText(), jsonSerializerOptions)
                                  ?? new ObservableCollection<Quiz>();

                    return quizzes;
                }
                else
                    Debug.WriteLine("Error: 'data.quizzes' field missing or not an array.");
            }

            return new ObservableCollection<Quiz>();
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error fetching quizzes: {ex.Message}");
            return new ObservableCollection<Quiz>();
        }
    }

    public static async Task<List<QuizCard>> GetQuizCardsByIdAsync(string quizId, ObservableCollection<Quiz> existingQuizzes)
    {
        string url = $"http://localhost:3000/api/v1/quizzes/{quizId}";
        client.DefaultRequestHeaders.Remove("X-Api-Key");
        client.DefaultRequestHeaders.Add("X-Api-Key", SharedStateService.Instance.ApiKey);

        try
        {
            HttpResponseMessage response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            string jsonResponse = await response.Content.ReadAsStringAsync();

            using (JsonDocument doc = JsonDocument.Parse(jsonResponse))
            {
                JsonElement root = doc.RootElement;

                if (root.TryGetProperty("data", out JsonElement dataElement))
                {
                    List<QuizCard> quizCards = new List<QuizCard>();
                    if (dataElement.TryGetProperty("cards", out JsonElement cardsElement) &&
                        cardsElement.ValueKind == JsonValueKind.Array)
                    {
                        quizCards = JsonSerializer.Deserialize<List<QuizCard>>(cardsElement.GetRawText(), jsonSerializerOptions)
                                    ?? new List<QuizCard>();
                    }

                    //username
                    string username = "Unknown";
                    if (dataElement.TryGetProperty("user", out JsonElement userElement) &&
                        userElement.TryGetProperty("username", out JsonElement usernameElement))
                    {
                        username = usernameElement.GetString() ?? "Unknown";
                    }

                    //tags
                    List<TagWrapper> tags = new List<TagWrapper>();
                    if (dataElement.TryGetProperty("tags", out JsonElement tagsElement) &&
                        tagsElement.ValueKind == JsonValueKind.Array)
                    {
                        tags = JsonSerializer.Deserialize<List<TagWrapper>>(tagsElement.GetRawText(), jsonSerializerOptions)
                               ?? new List<TagWrapper>();
                    }

                    var existingQuiz = existingQuizzes.FirstOrDefault(q => q.UUID == quizId);
                    if (existingQuiz != null)
                    {
                        if (existingQuiz.User == null)
                            existingQuiz.User = new UserWrapper { Username = username };
                        else
                            existingQuiz.User.Username = username;

                        existingQuiz.Tags = tags;
                    }
                    else
                        Debug.WriteLine($"Quiz with ID {quizId} not found in existing collection.");

                    return quizCards;
                }
            }

            return new List<QuizCard>();
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error fetching quiz cards for {quizId}: {ex.Message}");
            return new List<QuizCard>();
        }
    }
}