package com.kob.backend.controller.user;

import com.kob.backend.mapper.UserMapper;
import com.kob.backend.pojo.User;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {
  @Autowired UserMapper userMapper;

  @GetMapping("/user/all")
  public List<User> getAll() {
    return userMapper.selectList(null);
  }

  @GetMapping("/user/{userId}")
  public User getUserById(@PathVariable Integer userId) {
    return userMapper.selectById(userId);
  }

  @GetMapping("/user/add/{userId}/{username}/{password}")
  public String addUser(
      @PathVariable Integer userId, @PathVariable String username, @PathVariable String password) {
    if (password.length() < 6) {
      return "密码过短";
    }
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    String encodePassword = passwordEncoder.encode(password);
    User user = new User(userId, username, encodePassword);
    userMapper.insert(user);
    return "Add User Successfully";
  }

  @GetMapping("/user/delete/{userId}")
  public String deleteUser(@PathVariable Integer userId) {
    userMapper.deleteById(userId);
    return "Delete User Successfully";
  }
}
