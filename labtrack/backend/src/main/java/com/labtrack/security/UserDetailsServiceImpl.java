package com.labtrack.security;

import com.labtrack.entity.User;
import com.labtrack.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository users;

    public UserDetailsServiceImpl(UserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = users.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username));
        return new org.springframework.security.core.userdetails.User(
                u.getUsername(), u.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole())));
    }
}
