-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create games table
CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mode text NOT NULL CHECK (mode IN ('ai', 'two_player')),
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  result text CHECK (result IN ('win', 'loss', 'draw')),
  winner text CHECK (winner IN ('X', 'O', 'draw')),
  player_symbol text NOT NULL CHECK (player_symbol IN ('X', 'O')),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create moves table
CREATE TABLE public.moves (
  id bigserial PRIMARY KEY,
  game_id uuid REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  player text NOT NULL CHECK (player IN ('X', 'O')),
  row int NOT NULL CHECK (row >= 0 AND row <= 2),
  col int NOT NULL CHECK (col >= 0 AND col <= 2),
  move_index int NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moves ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Games policies
CREATE POLICY "Users can view their own games"
  ON public.games FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own games"
  ON public.games FOR UPDATE
  USING (auth.uid() = player_id);

-- Moves policies
CREATE POLICY "Users can view moves for their games"
  ON public.moves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.games
      WHERE games.id = moves.game_id
      AND games.player_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert moves for their games"
  ON public.moves FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games
      WHERE games.id = moves.game_id
      AND games.player_id = auth.uid()
    )
  );

-- Create trigger for auto-creating profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index for better performance
CREATE INDEX idx_games_player_id ON public.games(player_id);
CREATE INDEX idx_moves_game_id ON public.moves(game_id);