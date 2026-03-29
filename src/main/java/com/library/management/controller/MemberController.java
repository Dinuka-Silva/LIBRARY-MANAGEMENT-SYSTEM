package com.library.management.controller;

import com.library.management.entity.Member;
import com.library.management.entity.MembershipPlan;
import com.library.management.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    @PostMapping
    public Member createMember(@RequestBody Member member) {
        return memberService.saveMember(member);
    }

    @PutMapping("/{id}")
    public Member updateMember(@PathVariable String id, @RequestBody Member updatedMember) {
        Member existing = memberService.getMemberById(id);
        existing.setName(updatedMember.getName());
        existing.setEmail(updatedMember.getEmail());
        existing.setPhone(updatedMember.getPhone());
        return memberService.saveMember(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable String id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{memberId}/membership/{planId}")
    public Member assignMembership(@PathVariable String memberId, @PathVariable String planId) {
        return memberService.assignMembership(memberId, planId);
    }

    @GetMapping("/plans")
    public List<MembershipPlan> getMembershipPlans() {
        return memberService.getAllMembershipPlans();
    }

    @PostMapping("/plans")
    public MembershipPlan createMembershipPlan(@RequestBody MembershipPlan plan) {
        return memberService.saveMembershipPlan(plan);
    }
}
