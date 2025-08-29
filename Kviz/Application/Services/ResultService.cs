using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Infrastructure.Interfaces;
using Infrastructure.Models;

namespace Application.Services
{
    public class ResultService(IResultRepository repository, IMapper map) : IResultService
    {
        private readonly IResultRepository _repo = repository;
        private readonly IMapper _mapper = map;

        public async Task<bool> AddResult(ResultDto result)
        {
            try
            {
                var model = _mapper.Map<Result>(result);
                var added = await _repo.AddAsync(model);
                return added != null;
            }
            catch
            {
                return false;
            }
        }

        public async Task<IEnumerable<ResultDto>> GetAllResults()
        {
            try
            {
                var results = await _repo.GetAllAsync();
                return _mapper.Map<IEnumerable<ResultDto>>(results);
            }
            catch
            {
                return [];
            }
        }

        public async Task<IEnumerable<ResultDto>> GetAllUserResultsByUsername(string username)
        {
            try
            {
                var results = await _repo.GetByUsernameAsync(username);
                return _mapper.Map<IEnumerable<ResultDto>>(results);
            }
            catch
            {
                return [];
            }
        }
    }
}
