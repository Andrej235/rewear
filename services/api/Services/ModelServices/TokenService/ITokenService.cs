using System.Security.Claims;
using Template.Models;

namespace Template.Services.ModelServices.TokenService;

public interface ITokenService
{
    string GenerateJwtToken(User user);

    Task<string> GenerateRefreshToken(User user, RefreshToken? existingToken = null);

    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
