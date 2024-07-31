import React, { useEffect, useState, useCallback } from 'react';
import '../src/Userlist.css';

const fakeUrl = "https://dummyjson.com/users";

const Userlist = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [filters, setFilters] = useState({ gender: '', city: '' });

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${fakeUrl}?limit=10&skip=${(page - 1) * 10}`);
      const data = await response.json();
      setUserData(prevData => [...prevData, ...data.users]);
      setHasMore(data.users.length > 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    let sortedData = [...userData];

    if (sortConfig) {
      sortedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    if (filters.gender || filters.city) {
      sortedData = sortedData.filter(user =>
        (!filters.gender || user.gender === filters.gender) &&
        (!filters.city || user.address.city.toLowerCase().includes(filters.city.toLowerCase()))
      );
    }

    setFilteredData(sortedData);
  }, [userData, sortConfig, filters]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || !hasMore) return;
    setPage(prevPage => prevPage + 1);
  }, [hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className='container'>
        <div className='header'>
            <h2>Employees</h2>
        <div className="filters">
        <label>
          Gender:
          <select name="gender" onChange={handleFilterChange} value={filters.gender}>
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label>
          Country:
          <input name="city" type="text" placeholder="city" onChange={handleFilterChange} value={filters.city} />
        </label>
      </div>
        </div>
      <table className='users'>
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>ID</th>
            <th>Image</th>
            <th onClick={() => handleSort('firstName')}>Full Name</th>
            <th onClick={() => handleSort('age')}>Demography</th>
            <th>Designation</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(eachItem => (
            <tr key={eachItem.id}>
              <td>{eachItem.id}</td>
              <td>
                <img src={eachItem.image} alt={`${eachItem.firstName} ${eachItem.lastName}`} width={50} height={50} />
              </td>
              <td>{eachItem.firstName} {eachItem.lastName}</td>
              <td>{eachItem.age} / {eachItem.gender}</td>
              <td>{eachItem.company.title}</td>
              <td>{eachItem.address.city}, {eachItem.address.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && <p>Loading more users...</p>}
    </div>
  );
}

export default Userlist;

