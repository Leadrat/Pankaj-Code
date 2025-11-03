import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../domain/entities/admin_statistics.dart';

class StatisticsCard extends StatelessWidget {
  final AdminStatistics statistics;

  const StatisticsCard({
    super.key,
    required this.statistics,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'System Statistics',
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.7,
              children: [
                _StatItem(
                  icon: Icons.people,
                  label: 'Total Users',
                  value: statistics.totalUsers.toString(),
                  color: Colors.blue,
                ),
                _StatItem(
                  icon: Icons.verified_user,
                  label: 'Active Users',
                  value: statistics.activeUsers.toString(),
                  color: Colors.green,
                ),
                _StatItem(
                  icon: Icons.sports_esports,
                  label: 'Total Matches',
                  value: statistics.totalMatches.toString(),
                  color: Colors.orange,
                ),
                _StatItem(
                  icon: Icons.check_circle,
                  label: 'Completed',
                  value: statistics.completedMatches.toString(),
                  color: Colors.purple,
                ),
                _StatItem(
                  icon: Icons.score,
                  label: 'Total Score',
                  value: statistics.totalScore.toString(),
                  color: Colors.red,
                ),
                _StatItem(
                  icon: Icons.trending_up,
                  label: 'Average Score',
                  value: statistics.averageScore.toString(),
                  color: Colors.teal,
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _RateIndicator(
                  label: 'Active User Rate',
                  percentage: statistics.activeUserRate,
                  color: Colors.green,
                ),
                _RateIndicator(
                  label: 'Match Completion Rate',
                  percentage: statistics.matchCompletionRate,
                  color: Colors.blue,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            Icon(
              icon,
              color: color,
              size: 24,
            ),
            Text(
              value,
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 12,
                color: Colors.black,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _RateIndicator extends StatelessWidget {
  final String label;
  final double percentage;
  final Color color;

  const _RateIndicator({
    required this.label,
    required this.percentage,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 12,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          children: [
            Container(
              width: 100,
              height: 8,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(4),
              ),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: percentage,
                child: Container(
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '${(percentage * 100).toStringAsFixed(1)}%',
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.black,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
