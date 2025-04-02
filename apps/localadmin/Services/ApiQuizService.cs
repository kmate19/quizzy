using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Windows.Forms;
using localadmin.Models;
using localadmin.Services;
using static localadmin.Models.Quiz;
using static localadmin.Models.User;

public static class ApiQuizzesService
{
    public class DetailedQuizData
    {
        public List<QuizCard> Cards { get; set; } = new();
        public string Username { get; set; } = "Unknown";
        public string Status { get; set; } = "Unknown";
        public List<TagWrapper> Tags { get; set; } = new();
    }


    private static readonly HttpClient client = new HttpClient();
    private static readonly JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        IncludeFields = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    /// <summary>
    /// ez a függvény lekéri az összes quiz-t az adatbázisból
    /// </summary>
    /// <param name="page"></param>
    /// <param name="pagesize"></param>
    /// <returns>A quizek</returns>
    public static async Task<(ObservableCollection<Quiz> Quizzes, int TotalCount)> GetQuizzesAsync(int page, int pagesize)
    {
        string url = $"http://localhost:3000/api/v1/admin/all-quizzes"; //?page={page}&limit={pagesize}
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
                int totalCount = 0;
                ObservableCollection<Quiz> quizzes = new();

                if (root.TryGetProperty("data", out JsonElement dataElement))
                {
                    //itt szedjük ki azt, hogy összesen hány quiz van
                    if (dataElement.TryGetProperty("totalCount", out JsonElement totalElement))
                    {

                        string? totalCountStr = totalElement.GetString();
                        if (int.TryParse(totalCountStr, out int parsedValue))
                            totalCount = parsedValue;
                    }

                    //Itt a quizzes tömböt szedjük ki amiben a quiz-ek vannak
                    if (dataElement.TryGetProperty("quizzes", out JsonElement quizzesElement) && quizzesElement.ValueKind == JsonValueKind.Array)
                    {
                        quizzes = JsonSerializer.Deserialize<ObservableCollection<Quiz>>(quizzesElement.GetRawText(), jsonSerializerOptions) ?? new();

                        foreach (var quiz in quizzes)
                        {
                            if (dataElement.TryGetProperty("languages", out JsonElement languagesElement) && languagesElement.ValueKind == JsonValueKind.Array)
                            {
                                quiz.Languages = JsonSerializer.Deserialize<List<LanguageWrapper>>(languagesElement.GetRawText(), jsonSerializerOptions) ?? new();
                            }
                        }
                    }
                    else
                    {
                        Debug.WriteLine("Error: 'data.quizzes' field missing or not an array.");
                    }
                }

                return (quizzes, totalCount);
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error fetching quizzes: {ex.Message}");
            return (new ObservableCollection<Quiz>(), 0);
        }
    }


    /// <summary>
    /// mivel az e fölött lévő függvény nem ad vissza nekünk minden információt, ezért itt külön lekérjük a quizekhez tartozó kérdéseket. Ez a függvény minden quizen végig megy.
    /// </summary>
    /// <param name="quizId"></param>
    /// <param name="quiz"></param>
    /// <returns>A quiz kédései kártyákra szedve.</returns>
    public static async Task<DetailedQuizData?> GetQuizCardsByIdAsync(string quizId)
    {
        string url = $"http://localhost:3000/api/v1/admin/{quizId}";
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
                    DetailedQuizData detailedData = new DetailedQuizData();

                    //kártyák, ebbe vannak a kérdések, válaszok, stb.
                    if (dataElement.TryGetProperty("cards", out JsonElement cardsElement) &&
                        cardsElement.ValueKind == JsonValueKind.Array)
                    {
                        detailedData.Cards = JsonSerializer.Deserialize<List<QuizCard>>(cardsElement.GetRawText(), jsonSerializerOptions)
                                            ?? new List<QuizCard>();
                    }

                    //felhasználó neve aki csinálta
                    if (dataElement.TryGetProperty("user", out JsonElement userElement) &&
                        userElement.TryGetProperty("username", out JsonElement usernameElement))
                    {
                        detailedData.Username = usernameElement.GetString() ?? "Unknown";
                    }

                    //a quiz státusza
                    if (dataElement.TryGetProperty("status", out JsonElement statusElement))
                    {
                        detailedData.Status = statusElement.GetString() ?? "Unknown";
                    }

                    //a quizhez tartozó tag-ek
                    if (dataElement.TryGetProperty("tags", out JsonElement tagsElement) &&
                        tagsElement.ValueKind == JsonValueKind.Array)
                    {
                        detailedData.Tags = JsonSerializer.Deserialize<List<TagWrapper>>(tagsElement.GetRawText(), jsonSerializerOptions)
                                           ?? new List<TagWrapper>();
                    }

                    return detailedData;
                }
            }

            return null;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error fetching quiz details for {quizId}: {ex.Message}");
            return null;
        }
    }


    public static async Task<bool> UpdateQuizStatus(string quizId, EQuizStatus status)
    {
        string url = "http://localhost:3000/api/v1/admin/set/quiz";
        client.DefaultRequestHeaders.Remove("X-Api-Key");
        client.DefaultRequestHeaders.Add("X-Api-Key", SharedStateService.Instance.ApiKey);

        var body = new
        {
            quizId = quizId,
            approve = status.ToString().ToLower()
        };

        Debug.WriteLine(body);

        string jsonPayload = JsonSerializer.Serialize(body);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        try
        {
            HttpResponseMessage response = await client.PostAsync(url, content);
            string responseText = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                Debug.WriteLine("Quiz status updated!");
                return true;
            }
            else
            {
                Debug.WriteLine($"Failed to update quiz status: {response.StatusCode}");
                return false;
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error updating quiz status: {ex.Message}");
            return false;
        }
    }
}