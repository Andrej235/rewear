using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Response.User;
using ReWear.Errors;
using ReWear.Models.Enums;
using ReWear.Services.Read;
using ReWear.Utilities;

namespace ReWear.Services.ModelServices.UserService;

public partial class UserService
{
    public Task<Result<UserResponseDto>> Get(
        ClaimsPrincipal claim,
        CancellationToken cancellationToken
    )
    {
        var userId = userManager.GetUserId(claim);
        if (userId is null)
            return Task.FromResult(Result.Fail<UserResponseDto>(new NotFound("User not found")));

        return userReadService.Get(
            x => new UserResponseDto
            {
                Username = x.UserName!,
                Email = x.Email!,
                IsEmailVerified = x.EmailConfirmed,
                HasSubscription = x.Subscriptions.Any(),
            },
            x => x.Id == userId
        );
    }

    public Task<Result<FullUserResponseDto>> GetFull(
        ClaimsPrincipal claim,
        CancellationToken cancellationToken
    )
    {
        var userId = userManager.GetUserId(claim);
        if (userId is null)
            return Task.FromResult(
                Result.Fail<FullUserResponseDto>(new NotFound("User not found"))
            );

        return userReadService.Get(
            x => new FullUserResponseDto
            {
                Username = x.UserName!,
                Email = x.Email!,
                IsEmailVerified = x.EmailConfirmed,
                HasSubscription = x.Subscriptions.Any(),

                Gender = x.Gender,

                PrimaryStyle = x.PrimaryStyle,
                SecondaryStyles = x.SecondaryStyles,

                SeasonPreference = x.SeasonPreference,

                PreferredColors = x.PreferredColors,
                AvoidedColors = x.AvoidedColors,

                FitPreference = x.FitPreference,

                Sizes = x.Sizes.Select(x => new UserSizeResponseDto()
                {
                    Id = x.Id,
                    Label = x.Label,
                    SizeType = x.SizeType,
                }),

                AvoidedMaterials = x.AvoidedMaterials,
            },
            x => x.Id == userId,
            cancellationToken: cancellationToken
        );
    }

    public async Task<Result<IEnumerable<AdminUserResponseDto>>> GetAll(
        int offset,
        int limit,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var result = context.Users.Select(u => new AdminUserResponseDto
            {
                Id = u.Id,
                Email = u.Email ?? "Unknown",
                Username = u.UserName ?? "Unknown",
                Verified = u.EmailConfirmed,
                Role =
                    context
                        .UserRoles.Where(ur => ur.UserId == u.Id)
                        .Join(context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                        .FirstOrDefault() ?? "No Role",
                JoinedAt = u.CreatedAt,
                SubscriptionPlanName =
                    u.Subscriptions.OrderByDescending(s => s.StartDate)
                        .Select(s => s.SubscriptionPlan.Name)
                        .FirstOrDefault() ?? "No Subscription",
                LastEmbeddingGeneratedAt =
                    u.StyleEmbedding != null ? u.StyleEmbedding.UpdatedAt : null,
            });

            result = result.OrderBy(u => u.Username);

            return Result.Ok(
                (await result.ApplyOffsetAndLimit(offset, limit, cancellationToken)).AsEnumerable()
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get all users");
            return Result.Fail(new BadRequest("Failed to get all users"));
        }
    }

    public Task<Result<IEnumerable<UserSizeResponseDto>>> GetUserSizes(
        ClaimsPrincipal claim,
        IEnumerable<SizeType> sizeTypes,
        CancellationToken cancellationToken
    )
    {
        var userId = userManager.GetUserId(claim);
        if (userId is null)
            return Task.FromResult(
                Result.Fail<IEnumerable<UserSizeResponseDto>>(new NotFound("User not found"))
            );

        return sizeReadService.Get(
            x => new UserSizeResponseDto
            {
                Id = x.Id,
                Label = x.Label,
                SizeType = x.SizeType,
            },
            x => x.UserId == userId && sizeTypes.Contains(x.SizeType),
            cancellationToken: cancellationToken
        );
    }
}
