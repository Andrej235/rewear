using FluentResults;
using Pgvector;
using ReWear.Models;
using ReWear.Models.Enums;
using ReWear.Services.Create;
using ReWear.Services.GeminiEmbedding;
using ReWear.Services.Read;
using ReWear.Services.Update;
using ReWear.Utilities;

namespace ReWear.Services.ModelServices.ClothingItemEmbeddingService;

public class ClothingItemEmbeddingService(
    GeminiEmbeddingService geminiEmbeddingService,
    IReadSingleService<ClothingItem> clothingItemReadService,
    ICreateSingleService<ClothingItemEmbedding> createService,
    IExecuteUpdateService<ClothingItemEmbedding> updateService
) : IClothingItemEmbeddingService
{
    public async Task<Result> GenerateEmbedding(Guid id)
    {
        var itemResult = await clothingItemReadService.Get(x => x.Id == id);
        if (itemResult.IsFailed)
            return Result.Fail(itemResult.Errors);

        var item = itemResult.Value;

        if (item.Category == ClothingCategory.None)
            return Result.Fail("Cannot generate embedding for clothing item with 'None' category.");

        if (item.GenderTarget == GenderTarget.None)
            return Result.Fail(
                "Cannot generate embedding for clothing item with 'None' gender target."
            );

        if (item.PrimaryStyle == Style.None)
            return Result.Fail(
                "Cannot generate embedding for clothing item with 'None' primary style."
            );

        if (item.Colors == Color.None)
            return Result.Fail("Cannot generate embedding for clothing item with 'None' colors.");

        if (item.FitType == Fit.None)
            return Result.Fail("Cannot generate embedding for clothing item with 'None' fit type.");

        if (item.Material == Material.None)
            return Result.Fail("Cannot generate embedding for clothing item with 'None' material.");

        var category = item.Category.ToString().ToLower();
        var genderTarget =
            item.GenderTarget == GenderTarget.Unisex
                ? "all genders"
                : item.GenderTarget.ToString().ToLower();
        var primaryStyle = item.PrimaryStyle.ToString().ToLower();
        var secondaryStyles = item
            .SecondaryStyles.ToFlags()
            .Select(s => s.ToString().ToLower())
            .JoinWithCommasAndAnd();
        var fitType = item.FitType.ToString().ToLower();
        var colors = item
            .Colors.ToFlags()
            .Select(c => c.ToString().ToLower())
            .JoinWithCommasAndAnd();
        var season = item.Season == Season.All ? "all seasons" : item.Season.ToString().ToLower();
        var material = item.Material.ToString().ToLower();
        var brandName = item.BrandName.Trim();
        var description = item.Description.Trim();

        var text = $"""
            Clothing item:
            A {category} designed for {genderTarget}.
            Style: primarily {primaryStyle}{(
                secondaryStyles != "" ? $", with elements of {secondaryStyles}" : ""
            )}.
            Fit: {fitType}.
            Colors: {colors}.
            Season: suitable for {season}.
            Material: made of {material}.
            Brand: {brandName}.
            Description: {description}.
            """;

        var embeddingValues = await geminiEmbeddingService.EmbedAsync(text);

        if (embeddingValues.IsFailed)
            return Result.Fail(embeddingValues.Errors);

        if (embeddingValues.Value.Length != 1536)
            return Result.Fail("Embedding vector has an unexpected dimensionality.");

        NormalizeInPlace(embeddingValues.Value);
        var vector = new Vector(embeddingValues.Value);

        var updateResult = await updateService.Update(
            x => x.ClothingItemId == id,
            x =>
                x.SetProperty(x => x.Embedding, vector)
                    .SetProperty(x => x.UpdatedAt, DateTime.UtcNow.AsUTC())
        );

        if (updateResult.IsFailed)
        {
            var createResult = await createService.Add(
                new ClothingItemEmbedding
                {
                    ClothingItemId = id,
                    Embedding = vector,
                    UpdatedAt = DateTime.UtcNow.AsUTC(),
                }
            );

            if (createResult.IsFailed)
                return Result.Fail(createResult.Errors);
        }

        return Result.Ok();
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
