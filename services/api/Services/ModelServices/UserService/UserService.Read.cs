using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Response.User;
using ReWear.Errors;
using ReWear.Services.Read;
using ReWear.Utilities;

namespace ReWear.Services.ModelServices.UserService;

public partial class UserService
{
    public async Task<Result<UserResponseDto>> Get(
        ClaimsPrincipal claim,
        CancellationToken cancellationToken
    )
    {
        var userId = userManager.GetUserId(claim);
        if (userId is null)
            return Result.Fail(new NotFound("User not found"));

        var userResult = await userReadService.Get(x => x.Id == userId);

        if (userResult.IsFailed)
        {
            if (userResult.HasError<NotFound>())
                await signInManager.SignOutAsync();

            return Result.Fail(userResult.Errors);
        }

        return responseMapper.Map(userResult.Value);
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

        return userReadSelectedService.Get(
            x => new FullUserResponseDto
            {
                Username = x.UserName!,
                Email = x.Email!,
                IsEmailVerified = x.EmailConfirmed,

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
}
