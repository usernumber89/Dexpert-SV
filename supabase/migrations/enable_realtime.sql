-- Enable Realtime for tables needed by frontend subscriptions (idempotent)
do $$
begin
  begin
    alter publication supabase_realtime add table applications;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table portfolio_entries;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table certificates;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table pyme_credits;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table purchases;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table student_portfolios;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table pyme_galleries;
  exception when duplicate_object then null;
  end;
end;
$$;
