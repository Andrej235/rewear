namespace ReWear.Services.Storage;

public interface IStorageService
{
    Task<string> SaveAsync(string key, Stream fileStream, string contentType);
    Task<string> GetSignedUrlAsync(string key, TimeSpan? expiresIn = null);
    Task<string> GetPublicUrlAsync(string key, TimeSpan? expiresIn = null);
    Task DeleteAsync(string key);
}
