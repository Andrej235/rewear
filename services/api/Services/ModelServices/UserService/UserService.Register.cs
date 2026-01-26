using System.Security.Claims;
using System.Web;
using FluentResults;
using ReWear.Dtos.Request.User;
using ReWear.Errors;
using ReWear.Models;
using ReWear.Utilities;

namespace ReWear.Services.ModelServices.UserService;

public partial class UserService
{
    public async Task<Result> Register(RegisterRequestDto request)
    {
        var user = new User { Email = request.Email, UserName = request.Username };
        var userResult = await userManager.CreateAsync(user, request.Password);

        if (!userResult.Succeeded)
            return Result.Fail(userResult.Errors.Select(x => new BadRequest(x.Description)));

        var roleResult = await userManager.AddToRoleAsync(user, Roles.User);
        if (!roleResult.Succeeded)
            return Result.Fail(roleResult.Errors.Select(x => new BadRequest(x.Description)));

        var emailToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
        await emailSender.SendConfirmationLinkAsync(
            user,
            request.Email,
            $"{configuration["FrontendUrl"]}/confirm-email?token={HttpUtility.UrlEncode(emailToken)}&email={HttpUtility.UrlEncode(request.Email)}"
        );

        return Result.Ok();
    }

    public async Task<Result> SetupAccount(ClaimsPrincipal claim, SetupAccountRequestDto request)
    {
        var userId = userManager.GetUserId(claim);
        if (userId is null)
            return Result.Fail(new NotFound("User not found"));

        var updateResult = await updateService.Update(
            x => x.Id == userId,
            x =>
                x.SetProperty(x => x.Gender, request.Gender)
                    .SetProperty(x => x.PrimaryStyle, request.PrimaryStyle)
                    .SetProperty(x => x.SecondaryStyles, request.SecondaryStyles.FromFlags())
                    .SetProperty(x => x.SeasonPreference, request.SeasonPreference)
                    .SetProperty(x => x.PreferredColors, request.PreferredColors.FromFlags())
                    .SetProperty(x => x.AvoidedColors, request.AvoidedColors.FromFlags())
                    .SetProperty(x => x.FitPreference, request.FitPreference)
                    .SetProperty(x => x.AvoidedMaterials, request.AvoidedMaterials.FromFlags())
        );

        if (updateResult.IsFailed)
            return Result.Fail(updateResult.Errors);

        await userStyleEmbeddingService.GenerateEmbedding(userId);

        var sizesCreateResult = await userSizeCreateRangeService.Add(
            request.Sizes.Select(x => new UserSize
            {
                Label = x.Label,
                SizeType = x.SizeType,
                UserId = userId,
            })
        );

        if (sizesCreateResult.IsFailed)
            return Result.Fail(sizesCreateResult.Errors);

        var subscription = new UserSubscription
        {
            UserId = userId,
            SubscriptionPlanId = request.SubscriptionPlanId,
            StartDate = DateTime.UtcNow.AsUTC(),
            EndDate = DateTime.UtcNow.AddMonths(1).AsUTC(),
            NextRenewalDate = DateTime.UtcNow.AddMonths(1).AsUTC(),
            IsActive = true,
        };

        var subscriptionCreateResult = await userSubscriptionCreateService.Add(subscription);
        if (subscriptionCreateResult.IsFailed)
            return Result.Fail(subscriptionCreateResult.Errors);

        return Result.Ok();
    }
}
