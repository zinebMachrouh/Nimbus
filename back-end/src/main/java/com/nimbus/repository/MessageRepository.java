package com.nimbus.repository;

import com.nimbus.model.Message;
import com.nimbus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderOrderByCreatedAtDesc(User sender);
    List<Message> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Message> findBySenderAndRecipientOrderByCreatedAtDesc(User sender, User recipient);
    List<Message> findByRecipientAndReadOrderByCreatedAtDesc(User recipient, boolean read);
    List<Message> findBySenderOrRecipientOrderByCreatedAtDesc(User sender, User recipient);
}

