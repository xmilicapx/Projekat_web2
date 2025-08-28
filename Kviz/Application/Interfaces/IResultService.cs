using Application.DTOs;

namespace Application.Interfaces
{
    public interface IResultService
    {
        public Task<bool> AddResult(ResultDto result);
        public Task<IEnumerable<ResultDto>> GetAllResults();
        Task<IEnumerable<ResultDto>> GetAllUserResultsByUsername(string username);
    }
}
