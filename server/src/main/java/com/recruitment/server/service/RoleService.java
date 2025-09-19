package com.recruitment.server.service;

import com.recruitment.server.model.Role;
import com.recruitment.server.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleService {
    @Autowired
    private RoleRepository roleRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(Long roleId) {
        Optional<Role> role = roleRepository.findById(roleId);
        return role.orElse(null);
    }

    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    public Role updateRole(Long roleId, Role role) {
        if (roleRepository.existsById(roleId)) {
            role.setRoleId(roleId);
            return roleRepository.save(role);
        }
        return null;
    }

    public boolean deleteRole(Long roleId) {
        if (roleRepository.existsById(roleId)) {
            roleRepository.deleteById(roleId);
            return true;
        }
        return false;
    }
}
