using FluentResults;
using Pgvector;
using ReWear.Models;
using ReWear.Models.Enums;
using ReWear.Services.Create;
using ReWear.Services.GeminiEmbedding;
using ReWear.Services.Read;
using ReWear.Services.Update;
using ReWear.Utilities;

namespace ReWear.Services.ModelServices.UserStyleEmbeddingService;

public class UserStyleEmbeddingService(
    GeminiEmbeddingService geminiEmbeddingService,
    IReadSingleService<User> userReadService,
    IReadSingleSelectedService<UserStyleEmbedding> userStyleEmbeddingReadService,
    ICreateSingleService<UserStyleEmbedding> createService,
    IExecuteUpdateService<UserStyleEmbedding> updateService
) : IUserStyleEmbeddingService
{
    public async Task<Result<Vector>> GenerateEmbedding(string id)
    {
        var itemResult = await userReadService.Get(x => x.Id == id);
        if (itemResult.IsFailed)
            return Result.Fail(itemResult.Errors);

        var item = itemResult.Value;

        if (item.PrimaryStyle == Style.None)
            return Result.Fail("User has no primary style set.");

        if (item.FitPreference == Fit.None)
            return Result.Fail("User has no fit preference set.");

        var gender =
            item.Gender == Gender.None || item.Gender == Gender.Other
                ? "non-binary"
                : item.Gender.ToString().ToLower();
        var primaryStyle = item.PrimaryStyle.ToString().ToLower();
        var secondaryStyles = item
            .SecondaryStyles.ToFlags()
            .Select(s => s.ToString().ToLower())
            .JoinWithCommasAndAnd();
        var fit = item.FitPreference.ToString().ToLower();
        var preferredColors = item
            .PreferredColors.ToFlags()
            .Select(c => c.ToString().ToLower())
            .JoinWithCommasAndAnd();
        var avoidedColors = item
            .AvoidedColors.ToFlags()
            .Select(c => c.ToString().ToLower())
            .JoinWithCommasAndAnd();
        var preferredSeasonality =
            item.SeasonPreference == Season.All
                ? "no strong preference"
                : item.SeasonPreference.ToString().ToLower();
        var avoidedMaterials = item
            .AvoidedMaterials.ToFlags()
            .Select(m => m.ToString().ToLower())
            .JoinWithCommasAndAnd();

        var text = $"""
            User clothing preferences:
            Gender: {gender}.
            Preferred styles: primarily {primaryStyle}, also likes {(
                string.IsNullOrWhiteSpace(secondaryStyles) ? "no secondary styles" : secondaryStyles
            )}.
            Preferred fit: {fit}.
            Preferred colors: {(
                string.IsNullOrWhiteSpace(preferredColors) ? "no strong preference" : preferredColors
            )}.
            Disliked colors: {(
                string.IsNullOrWhiteSpace(avoidedColors) ? "none" : avoidedColors
            )}.
            Preferred seasonality: {preferredSeasonality}.
            Avoided materials: {(
                string.IsNullOrWhiteSpace(avoidedMaterials)
                    ? "none"
                    : avoidedMaterials
            )}.
            """;

        var embeddingValues = await geminiEmbeddingService.EmbedAsync(text);

        if (embeddingValues.IsFailed)
            return Result.Fail(embeddingValues.Errors);

        if (embeddingValues.Value.Length != 1536)
            return Result.Fail("Embedding vector has an unexpected dimensionality.");

        NormalizeInPlace(embeddingValues.Value);
        var vector = new Vector(embeddingValues.Value);

        var updateResult = await updateService.Update(
            x => x.UserId == id,
            x =>
                x.SetProperty(x => x.Embedding, vector)
                    .SetProperty(x => x.UpdatedAt, DateTime.UtcNow.AsUTC())
        );

        if (updateResult.IsFailed)
        {
            var createResult = await createService.Add(
                new UserStyleEmbedding
                {
                    UserId = id,
                    Embedding = vector,
                    UpdatedAt = DateTime.UtcNow.AsUTC(),
                }
            );

            if (createResult.IsFailed)
                return Result.Fail(createResult.Errors);
        }

        return vector;
    }

    public async Task<Result<Vector>> GetOrGenerateEmbedding(string id)
    {
        var readResult = await userStyleEmbeddingReadService.Get(
            x => new { x.Embedding },
            x => x.UserId == id
        );

        if (readResult.IsSuccess)
            return readResult.Value.Embedding;

        return await GenerateEmbedding(id);
    }

    void NormalizeInPlace(float[] v)
    {
        float sumSquares = 0f;
        foreach (var x in v)
            sumSquares += x * x;

        var norm = MathF.Sqrt(sumSquares);
        if (norm == 0f)
            throw new InvalidOperationException("Zero vector");

        for (int i = 0; i < v.Length; i++)
            v[i] /= norm;
    }
}
