﻿using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Net.Http;
using System.Numerics;
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

    public static async Task<(ObservableCollection<Quiz> Quizzes, int TotalCount)> GetQuizzesAsync(int page, int pagesize)
    {
        string url = $"http://localhost:3000/api/v1/quizzes?page={page}&limit={pagesize}";
        client.DefaultRequestHeaders.Remove("X-Api-Key");
        client.DefaultRequestHeaders.Add("X-Api-Key", SharedStateService.Instance.ApiKey);

        try
        {
            HttpResponseMessage response = await client.GetAsync(url);
            response.EnsureSuccessStatusCode();
            string jsonResponse = await response.Content.ReadAsStringAsync();
            Debug.WriteLine(jsonResponse);

            using (JsonDocument doc = JsonDocument.Parse(jsonResponse))
            {
                JsonElement root = doc.RootElement;
                int totalCount = 0;
                ObservableCollection<Quiz> quizzes = new();

                if (root.TryGetProperty("data", out JsonElement dataElement))
                {
                    // Get total count
                    if (dataElement.TryGetProperty("totalCount", out JsonElement totalElement))
                    {

                        string? totalCountStr = totalElement.GetString();
                        if (int.TryParse(totalCountStr, out int parsedValue))
                            totalCount = parsedValue;
                    }

                    // Get quizzes
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