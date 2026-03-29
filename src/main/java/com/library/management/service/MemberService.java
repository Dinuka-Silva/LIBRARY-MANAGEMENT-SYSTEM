package com.library.management.service;

import com.library.management.entity.Member;
import com.library.management.entity.MembershipPlan;
import com.library.management.repository.MemberRepository;
import com.library.management.repository.MembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {
    
    private final MemberRepository memberRepository;
    private final MembershipPlanRepository membershipPlanRepository;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member saveMember(Member member) {
        return memberRepository.save(member);
    }

    public void deleteMember(String id) {
        memberRepository.deleteById(id);
    }

    public Member getMemberById(String id) {
        return memberRepository.findById(id).orElseThrow(() -> new RuntimeException("Member not found"));
    }
    
    public List<MembershipPlan> getAllMembershipPlans() {
        return membershipPlanRepository.findAll();
    }
    
    public MembershipPlan saveMembershipPlan(MembershipPlan plan) {
        return membershipPlanRepository.save(plan);
    }

    public Member assignMembership(String memberId, String planId) {
        Member member = getMemberById(memberId);
        MembershipPlan plan = membershipPlanRepository.findById(planId).orElseThrow(() -> new RuntimeException("Plan not found"));
        
        member.setMembershipPlan(plan);
        member.setMembershipExpiryDate(LocalDate.now().plusMonths(plan.getDurationMonths()));
        
        return memberRepository.save(member);
    }
}
